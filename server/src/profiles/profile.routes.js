import express from "express";
import * as controller from "./profile.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Candidate
router.get("/me", authenticate, controller.myProfile);
router.put("/me", authenticate, controller.updateProfile);

// Recruiter/Admin (read-only)
router.get("/:userId", authenticate, controller.getProfileByUserId);

export default router;
