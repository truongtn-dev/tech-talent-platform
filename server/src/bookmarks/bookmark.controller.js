import * as service from "./bookmark.service.js";

export const addBookmark = async (req, res) => {
  try {
    const bookmark = await service.addBookmark(req.body.jobId, req.user);
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeBookmark = async (req, res) => {
  await service.removeBookmark(req.params.jobId, req.user);
  res.json({ message: "Bookmark removed" });
};

export const myBookmarks = async (req, res) => {
  const bookmarks = await service.getMyBookmarks(req.user);
  res.json(bookmarks);
};

export const checkBookmark = async (req, res) => {
  const bookmarked = await service.isBookmarked(req.params.jobId, req.user);
  res.json({ bookmarked });
};
