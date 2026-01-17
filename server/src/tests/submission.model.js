import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodingTest",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceCode: { type: String, required: true },
    language: { type: String, required: true },
    score: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 },
  },
  { timestamps: true },
);

SubmissionSchema.index({ testId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model("Submission", SubmissionSchema);
