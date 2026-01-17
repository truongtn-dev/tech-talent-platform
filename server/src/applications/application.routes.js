import express from "express";
import * as controller from "./application.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Candidate
router.post("/", authenticate, controller.applyJob);
router.get("/me", authenticate, controller.myApplications);
router.get("/check/:jobId", authenticate, controller.checkStatus);

// Recruiter/Admin
router.get("/job/:jobId", authenticate, controller.applicationsByJob);
router.put("/:id/status", authenticate, controller.updateStatus);

export default router;
