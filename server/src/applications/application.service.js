import Application from "./application.model.js";
import Job from "../jobs/job.model.js";
import Challenge from "../challenges/challenge.model.js";
import CV from "../cvs/cv.model.js";
import Upload from "../uploads/upload.model.js";
import Profile from "../profiles/profile.model.js";
import { analyzeMatching } from "../ai/gemini.service.js";
import { extractTextFromPDF } from "../ai/ocr.service.js";
import Interview from "../interviews/interview.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";
import mongoose from "mongoose";
import TestAssignment from "../challenges/testAssignment.model.js";

// Transition validation is now handled by Application.isValidTransition static method.

export const applyJob = async (data, user) => {
  if (user.role !== "CANDIDATE") {
    throw new Error("Only candidate can apply");
  }

  const { jobId, cvType, cvId, uploadId } = data;

  const isId = mongoose.Types.ObjectId.isValid(jobId);
  const job = isId 
    ? await Job.findById(jobId) 
    : await Job.findOne({ slug: jobId });

  if (!job || job.status !== "PUBLISHED") {
    throw new Error("Job not available or invalid ID/Slug");
  }
  const actualJobId = job._id;

  // Check existing application
  const existingApp = await Application.findOne({ jobId: actualJobId, candidateId: user.userId });
  if (existingApp) {
    throw new Error("You have already applied to this job");
  }

  let cvRef;
  let cvDataText = "";
  let resumeSnapshot = { capturedAt: new Date() };

  try {
    if (cvType === "ONLINE") {
      const cv = await CV.findById(cvId);
      if (!cv || cv.userId.toString() !== user.userId) throw new Error("Invalid CV");
      cvRef = cv._id;
      cvDataText = JSON.stringify(cv.data); // Simplify for AI
      resumeSnapshot.profileData = cv.data;
    } else if (cvType === "PROFILE") {
      const profile = await Profile.findOne({ userId: user.userId });
      if (!profile) throw new Error("Profile not found");
      cvRef = profile._id;
      // Construct standard profile data
      const profileData = {
        basics: { name: profile.fullName || user.email, email: user.email }, // basic assumption
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects
      };
      cvDataText = JSON.stringify(profileData);
      resumeSnapshot.profileData = profileData;
    } else if (cvType === "UPLOAD") {
      const upload = await Upload.findById(uploadId);
      if (!upload || upload.userId.toString() !== user.userId) throw new Error("Invalid Upload");
      cvRef = upload._id;
      resumeSnapshot.cvUrl = upload.filePath; // Store path/url
      // Text extraction would happen here
      cvDataText = await extractTextFromPDF(upload.filePath);
    }
  } catch (error) {
    console.error("Error preparing CV data:", error);
    throw new Error("Failed to process CV/Profile data");
  }

  // AI Screening
  let matchingScore = 0;
  let matchingReason = "";
  try {
    const aiResult = await analyzeMatching({
      job,
      resumeText: cvDataText,
    });
    matchingScore = aiResult.matchingScore || 0;
    matchingReason = aiResult.reason || "AI evaluated";
  } catch (err) {
    console.error("AI Matching failed:", err);
    matchingReason = "AI analysis pending/failed";
  }

  const application = await Application.create({
    jobId: actualJobId,
    candidateId: user.userId,
    cvType,
    cvRef,
    resumeSnapshot,
    status: "APPLIED",
    score: {
      aiMatching: matchingScore,
      aiExplanation: matchingReason
    },
    history: [{ status: "APPLIED", note: "Application received", at: new Date() }],
  });

  // Notification to Recruiter
  const notifData = {
    userId: job.recruiterId.toString(),
    title: "New Application",
    message: `New candidate for ${job.title}`,
    type: "NEW_APPLICATION",
    link: `/recruiter/applications/${application._id}`
  };
  await createNotification(notifData);
  emitToUser(job.recruiterId.toString(), "NEW_NOTIFICATION", notifData);

  return application;
};

export const getApplicationsByCandidate = async (userId) => {
  return Application.find({ candidateId: userId })
    .populate("jobId", "title company location status")
    .sort({ createdAt: -1 });
};

export const getApplicationsByJob = async (jobId, userId, role) => {
  const isId = mongoose.Types.ObjectId.isValid(jobId);
  const job = isId 
    ? await Job.findById(jobId) 
    : await Job.findOne({ slug: jobId });

  if (!job) throw new Error("Job not found");
  if (role !== "ADMIN" && job.recruiterId.toString() !== userId) throw new Error("Unauthorized");

  return Application.find({ jobId })
    .populate("candidateId", "email fullName") // simplified populate
    .sort({ "score.aiMatching": -1 });
};

export const updateStatus = async (applicationId, status, userId, role, note = "") => {
  const app = await Application.findById(applicationId).populate("jobId");
  if (!app) throw new Error("Application not found");

  const job = app.jobId;
  const isRecruiter = job.recruiterId.toString() === userId;
  const isAdmin = role === "ADMIN";

  // Authorization: Only Recruiter or Admin can change most statuses
  // Candidate can only 'WITHDRAW' or 'OFFER_ACCEPTED/DECLINED' (via specific endpoints ideally, but logic here)

  if (!isRecruiter && !isAdmin) {
    // Check if user is the candidate doing a self-update (e.g. withdraw)
    if (app.candidateId.toString() !== userId) {
      throw new Error("Unauthorized to update status");
    }
    // Candidate allowed transitions
    if (!["WITHDRAWN", "OFFER_ACCEPTED", "OFFER_DECLINED"].includes(status)) {
      throw new Error("Candidates can only withdraw or respond to offers");
    }
  }

  // Validate Transition
  if (!Application.isValidTransition(app.status, status)) {
    throw new Error(`Invalid status transition: ${app.status} -> ${status}`);
  }

  const oldStatus = app.status;
  app.status = status;
  app.history.push({
    status,
    updatedBy: userId,
    note,
    at: new Date()
  });

  await app.save();

  // Notify Candidate of status change
  if (status !== oldStatus) { // if changed
    const msgMap = {
      "TEST_ASSIGNED": "You have been assigned a coding test.",
      "INTERVIEW_SCHEDULED": "You have been invited to an interview.",
      "OFFER": "Congratulations! You have received an offer.",
      "REJECTED": "Update on your application status."
    };
    if (msgMap[status]) {
      const notif = {
        userId: app.candidateId.toString(),
        title: "Application Update",
        message: msgMap[status],
        type: "STATUS_CHANGE",
        link: `/dashboard/applications`
      };
      await createNotification(notif);
      emitToUser(app.candidateId.toString(), "NEW_NOTIFICATION", notif);
    }
  }

  return app;
};

// --- NEW ACTIONS ---

export const assignTest = async (applicationId, challengeId, recruiterId) => {
  const app = await Application.findById(applicationId);
  if (!app) throw new Error("Application not found");

  // Verify challenge exists
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new Error("Challenge not found");

  // Update App State
  if (!Application.isValidTransition(app.status, "TEST_ASSIGNED")) {
    throw new Error(`Invalid status transition: ${app.status} -> TEST_ASSIGNED`);
  }

  // Check for existing assignment
  let assignment = await TestAssignment.findOne({
    applicationId: app._id,
    challengeId: challenge._id
  });

  if (!assignment) {
    // Create Test Assignment if not exists
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days from now

    assignment = await TestAssignment.create({
      applicationId: app._id,
      candidateId: app.candidateId,
      challengeId: challenge._id,
      status: "PENDING",
      expiresAt,
    });
  } else {
    // If exists, ideally we just ensure it is active or reset it?
    // For now, let's just return success if already assigned to avoid error
    // Or update status if it was stuck?
    // Let's reset it to PENDING if explicitly re-assigned
    assignment.status = "PENDING";
    await assignment.save();
  }

  app.status = "TEST_ASSIGNED";
  app.testAssignmentId = assignment._id;

  app.history.push({
    status: "TEST_ASSIGNED",
    updatedBy: recruiterId,
    note: `Assigned Challenge: ${challenge.title}`,
    at: new Date()
  });

  await app.save();

  // Notify Candidate
  const notif = {
    userId: app.candidateId.toString(),
    title: "Coding Test Assigned",
    message: `You have been assigned a coding test: ${challenge.title}. Please complete it within the deadline.`,
    type: "TEST_ASSIGNED",
    link: `/candidate/test/${assignment._id}`
  };
  await createNotification(notif);
  emitToUser(app.candidateId.toString(), "NEW_NOTIFICATION", notif);

  return app;
};

export const checkUserApplication = async (jobIdParam, userId) => {
  const isId = mongoose.Types.ObjectId.isValid(jobIdParam);
  let query = { candidateId: userId };
  
  if (isId) {
    query.jobId = jobIdParam;
  } else {
    const job = await Job.findOne({ slug: jobIdParam });
    if (!job) return { applied: false };
    query.jobId = job._id;
  }

  const application = await Application.findOne(query).populate("jobId");
  if (application) {
    return {
      applied: true,
      applicationId: application._id,
      status: application.status,
    };
  }
  return { applied: false };
};

