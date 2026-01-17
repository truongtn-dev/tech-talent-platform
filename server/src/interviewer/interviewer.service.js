import Question from "../models/question.model.js";
import Application from "../applications/application.model.js";
import Job from "../jobs/job.model.js";
import Interview from "../interviews/interview.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";

export const getAvailableApplications = async () => {
    // Get applications that are SCREENED or TEST_SENT and don't have an interviewId yet
    return Application.find({
        status: { $in: ["SCREENED", "TEST_SENT"] },
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

    const interview = await Interview.create({
        applicationId,
        candidateId: application.candidateId,
        interviewerId,
        scheduledAt,
        meetingLink,
        status: "SCHEDULED"
    });

    // Update application
    application.interviewId = interview._id;
    application.status = "INTERVIEW";
    if (!application.timeline) application.timeline = [];
    application.timeline.push({ status: "INTERVIEW", at: new Date() });
    await application.save();

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
    const application = await Application.findById(id).populate("jobId");
    if (!application) throw new Error("Application not found");

    application.status = "COMPLETED"; // Or EVALUATED
    await application.save();

    // Notify Recruiter
    const notifData = {
        userId: application.jobId.recruiterId.toString(),
        title: "Interview Evaluated",
        message: `Technical interview for ${application.candidateId?.email || 'Candidate'} has been evaluated.`,
        type: "INTERVIEW_EVALUATED",
        link: `/recruiter/applications?jobId=${application.jobId._id}`
    };
    await createNotification(notifData);
    emitToUser(application.jobId.recruiterId.toString(), "NEW_NOTIFICATION", notifData);

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
