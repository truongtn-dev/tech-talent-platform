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

    firstName: String,
    lastName: String,
    fullName: String,
    phone: String,
    location: String,
    headline: String,
    summary: String,

    skills: [String],
    experienceYears: Number,

    education: [
      {
        school: { type: String, required: true },
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        location: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],

    projects: [
      {
        title: { type: String, required: true },
        role: String,
        startDate: Date,
        endDate: Date,
        description: String,
        url: String,
        technologies: [String],
      },
    ],

    certifications: [
      {
        name: { type: String, required: true },
        issuer: String,
        issueDate: Date,
        expirationDate: Date,
        url: String,
      },
    ],

    socialLinks: {
      linkedin: String,
      github: String,
      website: String,
      portfolio: String
    }
  },
  { timestamps: true },
);

export default mongoose.model("Profile", ProfileSchema);
