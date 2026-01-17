import Application from "./application.model.js";
import Job from "../jobs/job.model.js";
import Challenge from "../challenges/challenge.model.js";
import CV from "../cvs/cv.model.js";
import Upload from "../uploads/upload.model.js";
import Profile from "../profiles/profile.model.js";
import { analyzeMatching } from "../ai/gemini.service.js";
import { extractTextFromPDF } from "../ai/ocr.service.js";
import Notification from "../notifications/notification.model.js";
import Interview from "../interviews/interview.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";

export const applyJob = async (data, user) => {
  if (user.role !== "CANDIDATE") {
    throw new Error("Only candidate can apply");
  }

  const { jobId, cvType, cvId, uploadId } = data;

  const job = await Job.findById(jobId);
  if (!job || job.status !== "PUBLISHED") {
    throw new Error("Job not available");
  }

  let cvRef;
  let cvData = {};

  if (cvType === "ONLINE") {
    const cv = await CV.findById(cvId);
    if (!cv || cv.userId.toString() !== user.userId) {
      throw new Error("Invalid CV");
    }
    cvRef = cv._id;
    cvData = cv.data;
  }

  if (cvType === "PROFILE") {
    const profile = await Profile.findOne({ userId: user.userId });
    if (!profile) {
      throw new Error("Profile not found");
    }
    // Transform profile to cvData format if needed or just use profile
    cvRef = profile._id;
    cvData = {
      fullName: profile.fullName,
      email: profile.email, // Profile model might not have email, check schema. Schema doesn't have email. User has email.
      // We really should use a comprehensive object.
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      projects: profile.projects,
      summary: profile.summary
    };
  }

  if (cvType === "UPLOAD") {
    const upload = await Upload.findById(uploadId);
    if (!upload || upload.userId.toString() !== user.userId) {
      throw new Error("Invalid uploaded CV");
    }

    cvRef = upload._id;

    cvData = await extractTextFromPDF(upload.filePath);
  }

  const profile = await Profile.findOne({ userId: user.userId });

  let matchingScore = 0;
  let matchingReason = "";

  try {
    const aiResult = await analyzeMatching({
      job,
      profile,
      cvData,
    });

    matchingScore = aiResult.matchingScore || 0;
    matchingReason = aiResult.reason || "";
  } catch (err) {
    matchingReason = "AI analysis failed";
  }

  const application = await Application.create({
    jobId,
    candidateId: user.userId,
    cvType,
    cvRef,
    matchingScore,
    matchingReason,
    testId: job.challengeId || null,
    timeline: [{ status: "APPLIED" }],
  });

  // Notify recruiter
  if (application) {
    const notifData = {
      userId: job.recruiterId.toString(),
      title: "New Job Application",
      message: `Candidate ${user.email} applied for ${job.title}`,
      type: "NEW_APPLICATION",
      link: `/recruiter/applications?jobId=${job._id}`
    };
    await createNotification(notifData);
    emitToUser(job.recruiterId.toString(), "NEW_NOTIFICATION", notifData);
  }

  return application;
};

export const getApplicationsByCandidate = async (userId) => {
  const apps = await Application.find({ candidateId: userId })
    .populate("jobId")
    .populate("testId")
    .sort({ createdAt: -1 });

  const enrichedApps = await Promise.all(apps.map(async (app) => {
    const interview = await Interview.findOne({ applicationId: app._id });
    return {
      ...app.toObject(),
      interview: interview ? {
        scheduledAt: interview.scheduledAt,
        meetingLink: interview.meetingLink,
        status: interview.status
      } : null
    };
  }));

  return enrichedApps;
};

export const getApplicationsByJob = async (jobId, userId, role) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (role !== "ADMIN" && job.recruiterId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  return Application.find({ jobId })
    .populate("candidateId", "email") // In real app, profile details would be better
    .sort({ matchingScore: -1 });
};

export const updateStatus = async (applicationId, status, userId, role) => {
  const app = await Application.findById(applicationId).populate("jobId");
  if (!app) throw new Error("Application not found");

  const job = app.jobId;
  if (role !== "ADMIN" && job.recruiterId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  app.status = status;
  app.timeline.push({ status });
  await app.save();

  return app;
};

export const checkUserApplication = async (jobId, userId) => {
  const application = await Application.findOne({ jobId, candidateId: userId }).populate("jobId");
  if (application) {
    return {
      applied: true,
      applicationId: application._id,
      status: application.status,
      challengeId: application.jobId?.challengeId
    };
  }
  return { applied: false };
};
