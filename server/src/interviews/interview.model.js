import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      index: true,
      unique: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    meetingLink: {
      type: String,
    },

    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
      index: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
    },

    note: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Interview", InterviewSchema);
