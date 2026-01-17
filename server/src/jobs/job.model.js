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
    company: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String }, // Job thumbnail image URL

    skills: {
      type: [String],
      index: true,
    },

    requirements: {
      type: [String],
    },

    level: {
      type: String,
      enum: ["JUNIOR", "MID", "SENIOR"],
      default: "MID",
    },

    type: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"],
      default: "FULL_TIME",
    },

    salary: { type: String }, // e.g., "$50,000 - $80,000"
    location: { type: String, index: true },
    contactEmail: { type: String },
    applicationDeadline: { type: Date },

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
