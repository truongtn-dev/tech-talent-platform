import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["APPLICATION", "TEST", "INTERVIEW", "OFFER", "SYSTEM"],
      index: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", NotificationSchema);
