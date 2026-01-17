import mongoose from "mongoose";

const TestCaseSchema = new mongoose.Schema(
  {
    input: String,
    output: String,
    isHidden: { type: Boolean, default: false },
  },
  { _id: false },
);

const CodingTestSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: {
      type: String,
      enum: ["javascript", "python", "java"],
      default: "javascript",
    },
    timeLimit: { type: Number, default: 1 },
    testCases: [TestCaseSchema],
  },
  { timestamps: true },
);

export default mongoose.model("CodingTest", CodingTestSchema);
