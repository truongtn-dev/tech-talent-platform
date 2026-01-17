import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },

    fullName: String,
    phone: String,
    location: String,
    headline: String,
    summary: String,

    skills: [String],
    experienceYears: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Profile", ProfileSchema);
