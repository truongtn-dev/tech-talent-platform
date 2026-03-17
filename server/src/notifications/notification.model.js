import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["NEW_APPLICATION", "TEST_ASSIGNED", "TEST_SUBMITTED", "TEST_RESULT", "INTERVIEW_SCHEDULED", "INTERVIEW_ASSIGNED", "INTERVIEW_COMPLETED", "INTERVIEW_EVALUATED", "OFFER", "STATUS_CHANGE", "GENERAL"],
      default: "GENERAL"
    },
    link: { type: String }, // Optional link to redirect user
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
