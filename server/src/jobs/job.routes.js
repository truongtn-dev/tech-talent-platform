import express from "express";
import * as jobController from "./job.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);

// Protected
router.post("/", authenticate, jobController.createJob);
router.put("/:id", authenticate, jobController.updateJob);
router.delete("/:id", authenticate, jobController.deleteJob);

export default router;
