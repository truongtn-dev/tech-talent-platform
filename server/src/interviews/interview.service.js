import Interview from "./interview.model.js";
import Application from "../applications/application.model.js";
import { createNotification } from "../notifications/notification.service.js";
import { emitToUser } from "../utils/socket.js";

export const scheduleInterview = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  const application = await Application.findById(data.applicationId).populate("jobId");
  if (!application) {
    throw new Error("Application not found");
  }

  // Check state
  // We allow scheduling from TEST_SUBMITTED or SCREENED (if test skipped)
  // For now, let's just facilitate it

  const interview = await Interview.create({
    applicationId: data.applicationId,
    candidateId: application.candidateId,
    interviewerId: data.interviewerId,
    scheduledAt: data.scheduledAt,
    meetingLink: data.meetingLink || `https://meet.jit.si/${application._id}`, // Generate default link if missing
  });

  // Update Application
  application.status = "INTERVIEW_SCHEDULED";
  application.interviewId = interview._id;
  application.history.push({
    status: "INTERVIEW_SCHEDULED",
    updatedBy: user.userId,
    note: `Interview scheduled at ${data.scheduledAt}`,
    at: new Date()
  });
  await application.save();

  // Notify Candidate
  const candidateNotif = {
    userId: application.candidateId.toString(),
    title: "Interview Scheduled",
    message: `You have an interview for ${application.jobId.title} on ${new Date(data.scheduledAt).toLocaleString()}`,
    type: "INTERVIEW_SCHEDULED",
    link: `/dashboard/interviews`
  };
  await createNotification(candidateNotif);
  emitToUser(application.candidateId.toString(), "NEW_NOTIFICATION", candidateNotif);

  // Notify Interviewer
  const interviewerNotif = {
    userId: data.interviewerId,
    title: "New Interview Assigned",
    message: `You are assigned to interview a candidate for ${application.jobId.title}`,
    type: "INTERVIEW_ASSIGNED",
    link: `/interviewer/interviews/${interview._id}`
  };
  await createNotification(interviewerNotif);
  emitToUser(data.interviewerId, "NEW_NOTIFICATION", interviewerNotif);

  return interview;
};

export const getMyInterviews = async (user) => {
  return Interview.find({
    $or: [{ candidateId: user.userId }, { interviewerId: user.userId }],
  }).populate("applicationId candidateId interviewerId") // valuable info
    .sort({ scheduledAt: 1 });
};

export const completeInterview = async (id, data, user) => {
  const interview = await Interview.findById(id);
  if (!interview) throw new Error("Interview not found");

  if (
    user.role !== "ADMIN" &&
    interview.interviewerId.toString() !== user.userId
  ) {
    throw new Error("Permission denied. Only assigned interviewer can submit evaluation.");
  }

  interview.status = "COMPLETED";
  interview.score = data.score;
  interview.note = data.note;
  await interview.save();

  // Update Application
  const application = await Application.findById(interview.applicationId).populate("jobId");
  if (application) {
    application.status = "INTERVIEW_COMPLETED";
    application.score.interview = data.score; // Consolidate
    application.history.push({
      status: "INTERVIEW_COMPLETED",
      updatedBy: user.userId,
      note: `Interview Score: ${data.score}. Comments: ${data.note}`,
      at: new Date()
    });
    await application.save();

    // Notify Recruiter
    const notif = {
      userId: application.jobId.recruiterId.toString(),
      title: "Interview Completed",
      message: `Interviewer submitted feedback for ${application.jobId.title} (Score: ${data.score})`,
      type: "INTERVIEW_COMPLETED",
      link: `/recruiter/applications/${application._id}`
    };
    await createNotification(notif);
    emitToUser(application.jobId.recruiterId.toString(), "NEW_NOTIFICATION", notif);

    // Notify Candidate about their interview result
    const candidateNotif = {
      userId: application.candidateId.toString(),
      title: "Interview Feedback Received",
      message: `Your interview for ${application.jobId.title} has been evaluated. Score: ${data.score}/10`,
      type: "INTERVIEW_RESULT",
      link: `/my-applications`
    };
    await createNotification(candidateNotif);
    emitToUser(application.candidateId.toString(), "NEW_NOTIFICATION", candidateNotif);
  }

  return interview;
};
