import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    skillsRequired: {
      type: [String],
      index: true,
    },

    level: {
      type: String,
      enum: ["JUNIOR", "MID", "SENIOR"],
      default: "MID",
    },

    location: { type: String, index: true },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", JobSchema);
