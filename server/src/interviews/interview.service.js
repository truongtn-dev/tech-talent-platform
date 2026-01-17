import Interview from "./interview.model.js";
import Application from "../applications/application.model.js";

export const scheduleInterview = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  const application = await Application.findById(data.applicationId);
  if (!application) {
    throw new Error("Application not found");
  }

  return Interview.create({
    applicationId: data.applicationId,
    candidateId: application.candidateId,
    interviewerId: data.interviewerId,
    scheduledAt: data.scheduledAt,
    meetingLink: data.meetingLink,
  });
};

export const getMyInterviews = async (user) => {
  return Interview.find({
    $or: [{ candidateId: user.userId }, { interviewerId: user.userId }],
  }).sort({ scheduledAt: 1 });
};

export const completeInterview = async (id, data, user) => {
  const interview = await Interview.findById(id);
  if (!interview) throw new Error("Interview not found");

  if (
    user.role !== "ADMIN" &&
    interview.interviewerId.toString() !== user.userId
  ) {
    throw new Error("Permission denied");
  }

  interview.status = "COMPLETED";
  interview.score = data.score;
  interview.note = data.note;

  return interview.save();
};
