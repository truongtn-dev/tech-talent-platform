import express from "express";
import * as controller from "./interviewer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use((req, res, next) => {
    console.log(`Interviewer Request: ${req.method} ${req.url}`);
    next();
});
console.log("Interviewer Router Initialized");

// Test route
router.get("/hello", (req, res) => res.send("Interviewer API is alive"));
router.get("/jobs", controller.getJobs);

const requireInterviewer = (req, res, next) => {
    if (req.user.role !== "INTERVIEWER" && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Interviewer access only" });
    }
    next();
};

router.use(authenticate, requireInterviewer);

router.get("/questions", controller.getMyQuestions);
router.post("/questions", controller.createQuestion);
router.put("/questions/:id", controller.updateQuestion);
router.delete("/questions/:id", controller.deleteQuestion);
router.get("/stats", controller.getDashboardStats);
router.get("/sessions", controller.getInterviews);
router.get("/available-applications", controller.getAvailableApplications);
router.post("/sessions", controller.createInterviewSession);
router.put("/sessions/:id", controller.updateInterviewSession);
router.post("/sessions/:id/evaluate", controller.submitEvaluation);

export default router;
