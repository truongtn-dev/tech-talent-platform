import express from "express";
import * as controller from "./notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, controller.getMyNotifications);
router.patch("/:id/read", authenticate, controller.readNotification);
router.post("/read-all", authenticate, controller.readAllNotifications);

export default router;
