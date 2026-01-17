import Bookmark from "./bookmark.model.js";
import Job from "../jobs/job.model.js";

export const addBookmark = async (jobId, user) => {
  if (user.role !== "CANDIDATE") {
    throw new Error("Only candidate can bookmark job");
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== "PUBLISHED") {
    throw new Error("Job not available");
  }

  // Sử dụng findOneAndUpdate với upsert: true để tránh lỗi duplicate key
  return Bookmark.findOneAndUpdate(
    { userId: user.userId, jobId },
    { userId: user.userId, jobId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

export const removeBookmark = async (jobId, user) => {
  return Bookmark.findOneAndDelete({
    userId: user.userId,
    jobId,
  });
};

export const getMyBookmarks = async (user) => {
  return Bookmark.find({ userId: user.userId })
    .populate("jobId", "title company location level status type salary description skills thumbnail slug createdAt")
    .sort({ createdAt: -1 });
};

export const isBookmarked = async (jobId, user) => {
  const bookmark = await Bookmark.findOne({
    userId: user.userId,
    jobId,
  });
  return !!bookmark;
};
