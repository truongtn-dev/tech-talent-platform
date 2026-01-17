import express from "express";
import * as jobController from "./job.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadJobThumbnail } from "../utils/multer.js";

const router = express.Router();

// Public
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);

// Protected
router.post("/", authenticate, uploadJobThumbnail.single("thumbnail"), jobController.createJob);
router.put("/:id", authenticate, uploadJobThumbnail.single("thumbnail"), jobController.updateJob);
router.delete("/:id", authenticate, jobController.deleteJob);

export default router;
