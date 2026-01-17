import express from "express";
import * as controller from "./bookmark.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Candidate only
router.post("/", authenticate, controller.addBookmark);
router.delete("/:jobId", authenticate, controller.removeBookmark);
router.get("/me", authenticate, controller.myBookmarks);
router.get("/check/:jobId", authenticate, controller.checkBookmark);

export default router;
