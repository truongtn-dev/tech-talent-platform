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

  return Bookmark.create({
    userId: user.userId,
    jobId,
  });
};

export const removeBookmark = async (jobId, user) => {
  return Bookmark.findOneAndDelete({
    userId: user.userId,
    jobId,
  });
};

export const getMyBookmarks = async (user) => {
  return Bookmark.find({ userId: user.userId })
    .populate("jobId", "title location level status")
    .sort({ createdAt: -1 });
};

export const isBookmarked = async (jobId, user) => {
  const bookmark = await Bookmark.findOne({
    userId: user.userId,
    jobId,
  });
  return !!bookmark;
};
