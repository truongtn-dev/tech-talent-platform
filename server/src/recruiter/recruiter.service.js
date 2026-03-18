import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import User from "../modules/auth/user.model.js";
import Interview from "../interviews/interview.model.js";
import mongoose from "mongoose";
import { createNotification } from "../notifications/notification.service.js";
import { emitToUser } from "../utils/socket.js";
import { sendEmail, getInterviewTemplate } from "../utils/email.js";

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
    const application = await Application.findById(id).populate("jobId").populate("candidateId");
    if (!application) throw new Error("Application not found");

    if (application.jobId.recruiterId.toString() !== userId) {
        throw new Error("Unauthorized");
    }

    // CHECK GUARDRAIL
    if (!Application.isValidTransition(application.status, status)) {
        throw new Error(`Invalid status transition: ${application.status} -> ${status}`);
    }

    const oldStatus = application.status;
    application.status = status;
    application.history.push({
        status,
        at: new Date(),
        updatedBy: userId,
        note: `Status updated by recruiter`
    });
    
    await application.save();

    // CENTRALIZED NOTIFICATION DISPATCH
    const notifData = {
        userId: application.candidateId._id.toString(),
        title: "Application Status Update",
        message: `Your application for ${application.jobId.title} has been moved to ${status}.`,
        type: "STATUS_CHANGE",
        link: `/my-applications`
    };

    // Specific messages for critical statuses
    if (status === "REJECTED") {
        notifData.message = `We regret to inform you that your application for ${application.jobId.title} will not be moving forward at this time.`;
    } else if (status === "SCREENED") {
        notifData.message = `Great news! Your application for ${application.jobId.title} has been screened and is moving to the next stage.`;
    }

    await createNotification(notifData);
    emitToUser(application.candidateId._id.toString(), "NEW_NOTIFICATION", notifData);

    // Send Email for status change
    try {
        await sendEmail({
            to: application.candidateId.email,
            subject: `Application Status Changed: ${application.jobId.title}`,
            text: `Hi ${application.candidateId.fullName || "Candidate"},\n\nYour application for ${application.jobId.title} at ${application.jobId.company} has been updated.\n\nNew Status: ${status}\n\nMessage: ${notifData.message}\n\nPlease visit your dashboard for more details: ${process.env.CLIENT_URL || "http://localhost:5173"}/my-applications\n\nBest regards,\nTech Talent Team`
        });
    } catch (emailErr) {
        console.error("Failed to send status update email:", emailErr);
    }

    return application;
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
        status: "INTERVIEW_SCHEDULED"
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

        // Business Logic Guard: Block interview if test score is 0
        if (app.score && app.score.codingTest === 0) {
            throw new Error("Cannot schedule interview: Candidate failed the technical test with a score of 0.");
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
        if (!Application.isValidTransition(app.status, "INTERVIEW_SCHEDULED")) {
            throw new Error(`Invalid status transition: ${app.status} -> INTERVIEW_SCHEDULED`);
        }
        app.status = "INTERVIEW_SCHEDULED";
        app.interviewId = interview._id;
        app.history.push({ 
            status: "INTERVIEW_SCHEDULED", 
            updatedBy: recruiterId,
            note: "Interview scheduled",
            at: new Date() 
        });
        await app.save({ session });

        await session.commitTransaction();

        // Send Email to Candidate and Interviewer (Async)
        try {
            const candidate = await User.findById(interview.candidateId);
            const interviewer = await User.findById(interview.interviewerId);

            const interviewTemplate = getInterviewTemplate(candidate.fullName || "Candidate", app.jobId.title, scheduledAt, meetingLink);

            // Notify Candidate
            await sendEmail({
                to: candidate.email,
                ...interviewTemplate
            });

            // Notify Interviewer (Using same template but adding candidate info in text fallback if needed, but HTML is fine)
            await sendEmail({
                to: interviewer.email,
                subject: `[TechTalent] New Interview Assignment: ${app.jobId.title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #1677ff; border-radius: 10px;">
                        <h2 style="color: #1677ff;">New Interview Assignment</h2>
                        <p>Hi,</p>
                        <p>You have been assigned to interview a candidate for the <b>${app.jobId.title}</b> role.</p>
                        <ul>
                            <li><b>Candidate:</b> ${candidate.fullName || candidate.email}</li>
                            <li><b>Date:</b> ${new Date(scheduledAt).toLocaleString()}</li>
                            <li><b>Meeting Link:</b> <a href="${meetingLink}">${meetingLink}</a></li>
                        </ul>
                        <p>Candidate Profile: <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/interviewer/applications/${app._id}">View Profile</a></p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error("Failed to send interview emails:", emailErr);
        }

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
