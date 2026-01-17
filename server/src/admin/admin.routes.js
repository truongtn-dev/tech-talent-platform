import express from "express";
import * as controller from "./admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/users", controller.getUsers);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deleteUser);
router.put("/users/:id/toggle", controller.toggleUserStatus);

router.get("/jobs", controller.getJobs);
router.post("/jobs", controller.createJob);
router.put("/jobs/:id", controller.updateJob);
router.delete("/jobs/:id", controller.deleteJob);
router.put("/jobs/:id/approve", controller.approveJob);
router.put("/jobs/:id/hide", controller.hideJob);

router.get("/dashboard", controller.dashboard);
router.get("/applications", controller.getApplications);

export default router;
