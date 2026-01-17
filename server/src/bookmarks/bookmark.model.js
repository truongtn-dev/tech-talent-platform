import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// 1 user chỉ bookmark 1 job 1 lần
BookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("Bookmark", BookmarkSchema);
