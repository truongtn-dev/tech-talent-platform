import express from "express";
import * as controller from "./challenge.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to allow Admin or Recruiter to manage challenges
const requireAdminOrRecruiter = (req, res, next) => {
    if (req.user.role !== "ADMIN" && req.user.role !== "RECRUITER") {
        return res.status(403).json({ message: "Admin or Recruiter access only" });
    }
    next();
};

router.get("/", controller.getAllChallenges);
router.get("/:id", authenticate, controller.getChallengeDetails);
router.get("/assignment/:id", authenticate, controller.getTestAssignment);
router.post("/", authenticate, requireAdminOrRecruiter, controller.createChallenge);
router.put("/:id", authenticate, requireAdminOrRecruiter, controller.updateChallenge);
router.delete("/:id", authenticate, requireAdminOrRecruiter, controller.deleteChallenge);

router.post("/run", authenticate, controller.runCode);
router.post("/submit", authenticate, controller.submitChallenge);
router.post("/proctoring/:submissionId", authenticate, controller.logProctoring);

export default router;
