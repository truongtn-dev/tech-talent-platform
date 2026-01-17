import express from "express";
import * as controller from "./recruiter.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

const requireRecruiter = (req, res, next) => {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Recruiter access only" });
    }
    next();
};

router.use(authenticate, requireRecruiter);

// Job Management
router.get("/jobs", controller.getMyJobs);
router.post("/jobs", controller.createJob);
router.put("/jobs/:id", controller.updateJob);
router.delete("/jobs/:id", controller.deleteJob);

// Application Management
router.get("/applications", controller.getMyApplications);
router.put("/applications/:id/status", controller.updateApplicationStatus);

// Interview Management
router.get("/interviews", controller.getInterviews);
router.post("/interviews", controller.scheduleInterview);
router.put("/interviews/:id", controller.updateInterview);
router.delete("/interviews/:id", controller.deleteInterview);

// Dashboard
router.get("/stats", controller.getDashboardStats);

export default router;
