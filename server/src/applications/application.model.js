import mongoose from "mongoose";

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

    cvType: {
      type: String,
      enum: ["ONLINE", "UPLOAD", "PROFILE"],
      required: true,
    },

    cvRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "APPLIED",
        "SCREENED",
        "TEST_SENT",
        "INTERVIEW",
        "OFFER",
        "REJECTED",
      ],
      default: "APPLIED",
      index: true,
    },

    timeline: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],

    matchingScore: { type: Number, default: 0 },
    matchingReason: {
      type: String,
    },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge" },
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview" },
  },
  { timestamps: true },
);

ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);
