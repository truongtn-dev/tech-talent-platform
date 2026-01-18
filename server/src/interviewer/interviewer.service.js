import Question from "../models/question.model.js";
import Application from "../applications/application.model.js";
import Job from "../jobs/job.model.js";
import Interview from "../interviews/interview.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";

export const getAvailableApplications = async () => {
    // Get applications that are SCREENED or TEST_SENT and don't have an interviewId yet
    return Application.find({
        status: { $in: ["SCREENED", "TEST_ASSIGNED", "TEST_SUBMITTED"] },
        interviewId: { $exists: false }
    })
        .populate("candidateId", "email avatar")
        .populate("jobId", "title company")
        .sort({ updatedAt: -1 });
};

export const createInterviewSession = async (data, interviewerId) => {
    const { applicationId, scheduledAt, meetingLink } = data;

    const application = await Application.findById(applicationId);
    if (!application) throw new Error("Application not found");

    // Check for existing interview to prevent E11000 duplicate key error
    let interview = await Interview.findOne({ applicationId });

    if (interview) {
        // Update existing interview
        interview.interviewerId = interviewerId;
        if (scheduledAt) interview.scheduledAt = scheduledAt;
        if (meetingLink) interview.meetingLink = meetingLink;
        // Ensure status is valid for a re-schedule? defaulting keeping as is or ensure it's not cancelled if we want to revive?
        // simple update for now.
        await interview.save();
    } else {
        // Create new
        interview = await Interview.create({
            applicationId,
            candidateId: application.candidateId,
            interviewerId,
            scheduledAt,
            meetingLink,
            status: "SCHEDULED"
        });
    }

    // Ensure Application is linked and status is correct
    if (!application.interviewId || application.interviewId.toString() !== interview._id.toString()) {
        application.interviewId = interview._id;
    }

    // Update status if formerly something else
    if (application.status !== "INTERVIEW" && application.status !== "INTERVIEW_COMPLETED") {
        application.status = "INTERVIEW";
        if (!application.timeline) application.timeline = [];
        application.timeline.push({ status: "INTERVIEW", at: new Date() });
    }
    await application.save();

    // Notify Candidate
    const notifData = {
        userId: application.candidateId.toString(),
        title: "Interview Scheduled",
        message: `An interview has been scheduled for ${new Date(scheduledAt).toLocaleString()}. Check your dashboard for details.`,
        type: "INTERVIEW_SCHEDULED",
        link: `/my-applications`
    };
    await createNotification(notifData);
    emitToUser(application.candidateId.toString(), "NEW_NOTIFICATION", notifData);

    return interview;
};

export const getMyQuestions = async (userId) => {
    return Question.find({ interviewerId: userId }).populate("jobId", "title company").sort({ createdAt: -1 });
};

export const createQuestion = async (data, userId) => {
    return Question.create({
        ...data,
        interviewerId: userId,
    });
};

export const updateQuestion = async (id, data, userId) => {
    const question = await Question.findById(id);
    if (!question) throw new Error("Question not found");
    // Ensure the interviewer owns the question or is an admin
    if (question.interviewerId.toString() !== userId) throw new Error("Unauthorized");

    Object.assign(question, data);
    return question.save();
};

export const deleteQuestion = async (id, userId) => {
    const question = await Question.findById(id);
    if (!question) throw new Error("Question not found");
    if (question.interviewerId.toString() !== userId) throw new Error("Unauthorized");

    await question.deleteOne();
};

export const getInterviews = async (userId) => {
    return Interview.find({ interviewerId: userId })
        .populate({
            path: "applicationId",
            populate: { path: "jobId", select: "title company" }
        })
        .populate("candidateId", "email avatar")
        .sort({ scheduledAt: -1 });
};

export const updateInterviewSession = async (id, data, userId) => {
    const interview = await Interview.findById(id);
    if (!interview || interview.interviewerId.toString() !== userId) {
        throw new Error("Interview session not found or unauthorized");
    }

    if (data.scheduledAt) interview.scheduledAt = data.scheduledAt;
    if (data.meetingLink) interview.meetingLink = data.meetingLink;
    if (data.status) interview.status = data.status;

    return interview.save();
};

export const submitEvaluation = async (id, data, userId) => {
    // 1. Find the Interview Session
    const interview = await Interview.findById(id).populate("applicationId");
    if (!interview) throw new Error("Interview not found");
    if (interview.interviewerId.toString() !== userId) throw new Error("Unauthorized");

    // 2. Update Interview
    interview.score = data.score; // Assumption: data.score is the calculated score
    interview.note = data.notes;
    interview.status = "COMPLETED";
    // If you have a structured evaluation, save it too (add to schema if needed)
    // interview.evaluation = data; 
    await interview.save();

    // 3. Update Application
    const application = await Application.findById(interview.applicationId._id).populate("jobId");
    if (application) {
        application.status = "INTERVIEW_COMPLETED";
        if (!application.score) application.score = {};
        application.score.interview = data.score; // Consolidate score
        application.score.interviewNotes = data.notes;

        if (!application.timeline) application.timeline = [];
        application.timeline.push({
            status: "INTERVIEW_COMPLETED",
            at: new Date(),
            note: `Interview completed. Score: ${data.score}`
        });

        await application.save();

        // 4. Notify Recruiter
        const notifData = {
            userId: application.jobId.recruiterId.toString(),
            title: "Interview Evaluated",
            message: `Technical interview for ${application.candidateId?.email || 'Candidate'} has been evaluated. Score: ${data.score}`,
            type: "INTERVIEW_EVALUATED",
            link: `/recruiter/applications` // Simplified link
        };
        await createNotification(notifData);
        emitToUser(application.jobId.recruiterId.toString(), "NEW_NOTIFICATION", notifData);
    }

    return { message: "Evaluation submitted successfully", id };
};

export const getDashboardStats = async (userId) => {
    const [questionCount, interviewCount] = await Promise.all([
        Question.countDocuments({ interviewerId: userId }),
        Application.countDocuments({ status: "INTERVIEW" })
    ]);

    return {
        totalQuestions: questionCount,
        upcomingInterviews: interviewCount,
        completedEvaluations: 0 // Placeholder
    };
};

export const getJobs = async () => {
    return Job.find({ status: "APPROVED" }).select("title company");
};
