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
