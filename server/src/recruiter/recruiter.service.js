import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import User from "../modules/auth/user.model.js";
import Interview from "../interviews/interview.model.js";
import mongoose from "mongoose";
import { createNotification } from "../notifications/notification.service.js";
import { emitToUser } from "../utils/socket.js";

export const getMyJobs = async (userId) => {
    return Job.aggregate([
        { $match: { recruiterId: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "applications",
                localField: "_id",
                foreignField: "jobId",
                as: "applications"
            }
        },
        {
            $addFields: {
                applicationCount: { $size: "$applications" }
            }
        },
        { $project: { applications: 0 } },
        { $sort: { createdAt: -1 } }
    ]);
};

export const getInterviewers = async () => {
    return User.find({ role: "INTERVIEWER" }).select("email profile avatar");
};

export const createJob = async (jobData, userId) => {
    const job = await Job.create({
        ...jobData,
        recruiterId: userId,
        status: jobData.status || "PENDING"
    });

    // Notify all admins about new job pending approval
    if (job.status === "PENDING") {
        const admins = await User.find({ role: "ADMIN" }).select("_id");
        const adminNotifications = admins.map(async (admin) => {
            const notifData = {
                userId: admin._id.toString(),
                title: "New Job Pending Approval",
                message: `Recruiter has posted a new job: ${job.title} at ${job.company}`,
                type: "JOB_PENDING",
                link: `/admin/jobs`
            };
            await createNotification(notifData);
            emitToUser(admin._id.toString(), "NEW_NOTIFICATION", notifData);
        });
        await Promise.all(adminNotifications);
    }

    return job;
};

export const updateJob = async (id, jobData, userId) => {
    const job = await Job.findOne({ _id: id, recruiterId: userId });
    if (!job) throw new Error("Job not found or unauthorized");

    // If updating critical fields, might reset status to PENDING? 
    // For now, let's allow direct updates.
    Object.assign(job, jobData);
    return job.save();
};

export const deleteJob = async (id, userId) => {
    const job = await Job.findOneAndDelete({ _id: id, recruiterId: userId });
    if (!job) throw new Error("Job not found or unauthorized");
    return job;
};

export const getMyApplications = async (userId) => {
    const myJobIds = await Job.find({ recruiterId: userId }).distinct("_id");

    return Application.find({ jobId: { $in: myJobIds } })
        .populate("jobId", "title")
        .populate({
            path: "candidateId",
            select: "email avatar profile", // Include profile for details
        })
        .sort({ createdAt: -1 });
};

export const updateApplicationStatus = async (id, status, userId) => {
    // Verify application belongs to a job owned by this recruiter
    const application = await Application.findById(id).populate("jobId");
    if (!application) throw new Error("Application not found");

    if (application.jobId.recruiterId.toString() !== userId) {
        throw new Error("Unauthorized");
    }

    application.status = status;
    return application.save();
};

export const getDashboardStats = async (recruiterId) => {
    const jobIds = await Job.find({ recruiterId }).distinct("_id");

    const activeJobs = await Job.countDocuments({
        recruiterId,
        status: "PUBLISHED"
    });

    const totalApplications = await Application.countDocuments({
        jobId: { $in: jobIds }
    });

    const interviews = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: "INTERVIEW"
    });

    const hired = await Application.countDocuments({
        jobId: { $in: jobIds },
        status: "OFFER" // Assuming OFFER means hired/successful for now
    });

    return {
        activeJobs,
        totalApplications,
        interviews,
        hired
    };
};

export const getInterviews = async (recruiterId) => {
    // 1. Get all jobs owned by this recruiter
    const jobIds = await Job.find({ recruiterId }).distinct("_id");

    // 2. Find all interviews linked to applications for these jobs
    // We need to look up Interviews where the applicationId -> jobId is in jobIds
    // This is a bit complex with standard find, so we can:
    // a. Find applications first
    const applicationIds = await Application.find({ jobId: { $in: jobIds } }).distinct("_id");

    // b. Find interviews for those applications
    const interviews = await Interview.find({ applicationId: { $in: applicationIds } })
        .populate("applicationId")
        .populate("candidateId", "email profile avatar")
        .populate("interviewerId", "email profile")
        .sort({ scheduledAt: 1 });

    return interviews;
};

export const scheduleInterview = async (data, recruiterId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { applicationId, interviewerId, scheduledAt, meetingLink } = data;

        // Verify Application belongs to Recruiter's Job
        const app = await Application.findById(applicationId).populate("jobId");
        if (!app) throw new Error("Application not found");
        if (app.jobId.recruiterId.toString() !== recruiterId) {
            throw new Error("Unauthorized access to application");
        }

        // Create Interview
        const interview = new Interview({
            applicationId,
            candidateId: app.candidateId,
            interviewerId,
            scheduledAt,
            meetingLink,
            status: "SCHEDULED"
        });
        await interview.save({ session });

        // Update Application
        app.status = "INTERVIEW_SCHEDULED";
        app.interviewId = interview._id;
        app.timeline.push({ status: "INTERVIEW_SCHEDULED", at: new Date() });
        await app.save({ session });

        await session.commitTransaction();
        return interview;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const updateInterview = async (id, data, recruiterId) => {
    const interview = await Interview.findById(id).populate({
        path: "applicationId",
        populate: { path: "jobId" }
    });

    if (!interview) throw new Error("Interview not found");
    if (interview.applicationId.jobId.recruiterId.toString() !== recruiterId) {
        throw new Error("Unauthorized");
    }

    Object.assign(interview, data);
    return await interview.save();
};

export const deleteInterview = async (id, recruiterId) => {
    const interview = await Interview.findById(id).populate({
        path: "applicationId",
        populate: { path: "jobId" }
    });

    if (!interview) throw new Error("Interview not found");
    // if (interview.applicationId.jobId.recruiterId.toString() !== recruiterId) {
    //     throw new Error("Unauthorized");
    // }

    // Optional: Reset application status or keep as INTERVIEW?
    // Let's just delete the interview record.
    await Interview.findByIdAndDelete(id);

    // Update application to remove reference?
    await Application.findByIdAndUpdate(interview.applicationId._id, {
        $unset: { interviewId: 1 }
        // Keep status as INTERVIEW or revert? Revert is hard. Keep it.
    });

    return true;
};
