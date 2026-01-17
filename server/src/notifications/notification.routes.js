import express from "express";
import * as controller from "./notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", controller.myNotifications);
router.put("/:id/read", controller.markRead);

export default router;
