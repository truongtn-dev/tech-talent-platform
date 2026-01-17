import express from "express";
import * as controller from "./interview.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Recruiter/Admin
router.post("/", authenticate, controller.scheduleInterview);

// All logged users (candidate / interviewer)
router.get("/me", authenticate, controller.myInterviews);

// Interviewer/Admin
router.put("/:id/complete", authenticate, controller.completeInterview);

export default router;
