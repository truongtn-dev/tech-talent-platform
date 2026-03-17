import mongoose from "mongoose";

export const VALID_TRANSITIONS = {
  APPLIED: ["SCREENED", "REJECTED", "WITHDRAWN"],
  SCREENED: ["TEST_ASSIGNED", "INTERVIEW_SCHEDULED", "REJECTED", "WITHDRAWN"],
  TEST_ASSIGNED: ["TEST_SUBMITTED", "REJECTED", "WITHDRAWN"],
  TEST_SUBMITTED: ["INTERVIEW_SCHEDULED", "SCREENED", "REJECTED", "WITHDRAWN"],
  INTERVIEW_SCHEDULED: ["INTERVIEW_COMPLETED", "REJECTED", "WITHDRAWN"],
  INTERVIEW_COMPLETED: ["OFFER", "INTERVIEW_SCHEDULED", "REJECTED", "WITHDRAWN"],
  OFFER: ["OFFER_ACCEPTED", "OFFER_DECLINED", "REJECTED", "WITHDRAWN"],
  REJECTED: ["SCREENED"], // Allow manual "re-consideration" back to screened? Or keep locked.
  WITHDRAWN: [],
  OFFER_ACCEPTED: [],
  OFFER_DECLINED: []
};

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --- Candidate Snapshot (Immutable at time of apply) ---
    // Instead of just ref, we should store key details to prevent "Bait & Switch"
    resumeSnapshot: {
      cvUrl: { type: String }, // For UPLOAD type
      profileData: { type: Object }, // For ONLINE type
      capturedAt: { type: Date, default: Date.now },
    },

    cvType: {
      type: String,
      enum: ["ONLINE", "UPLOAD", "PROFILE"], // PROFILE matches ONLINE usually
      required: true,
    },
    // We keep ref for historical link, but Recruiter views Snapshot
    cvRef: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    // --- State Machine ---
    status: {
      type: String,
      enum: [
        "APPLIED",
        "SCREENED",
        "TEST_ASSIGNED",      // Recruiter assigned a test
        "TEST_SUBMITTED",     // Candidate finished test
        "INTERVIEW_SCHEDULED",// Recruiter invited
        "INTERVIEW_COMPLETED",// Interviewer submitted feedback
        "OFFER",
        "REJECTED",
        "WITHDRAWN",
        "OFFER_ACCEPTED",
        "OFFER_DECLINED"
      ],
      default: "APPLIED",
      index: true,
    },

    history: [
      {
        status: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],

    // --- Scoring & Evaluations ---
    score: {
      aiMatching: { type: Number, default: 0 }, // 0-100
      aiExplanation: String,
      codingTest: { type: Number }, // 0-100
      interview: { type: Number },  // 0-10
    },

    // --- Active Links ---
    testAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "TestAssignment" },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
  },
  { timestamps: true },
);

ApplicationSchema.statics.isValidTransition = function(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);
