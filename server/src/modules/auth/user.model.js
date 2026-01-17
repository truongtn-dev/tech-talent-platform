import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["CANDIDATE", "RECRUITER", "INTERVIEWER", "ADMIN"],
      default: "CANDIDATE",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ email: 1 });

export default mongoose.model("User", UserSchema);
