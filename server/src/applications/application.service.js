import Application from "./application.model.js";
import Job from "../jobs/job.model.js";
import CV from "../cvs/cv.model.js";
import Upload from "../uploads/upload.model.js";
import Profile from "../profiles/profile.model.js";
import { analyzeMatching } from "../ai/gemini.service.js";
import { extractTextFromPDF } from "../ai/ocr.service.js";

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

  return Application.create({
    jobId,
    candidateId: user.userId,
    cvType,
    cvRef,
    matchingScore,
    matchingReason,
    timeline: [{ status: "APPLIED" }],
  });
};

export const getApplicationsByCandidate = async (userId) => {
  return Application.find({ candidateId: userId })
    .populate("jobId", "title location")
    .sort({ createdAt: -1 });
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
