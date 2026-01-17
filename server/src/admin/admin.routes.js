import express from "express";
import * as controller from "./admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/users", controller.getUsers);
router.put("/users/:id/toggle", controller.toggleUserStatus);

router.put("/jobs/:id/approve", controller.approveJob);
router.put("/jobs/:id/hide", controller.hideJob);

router.get("/dashboard", controller.dashboard);

export default router;
