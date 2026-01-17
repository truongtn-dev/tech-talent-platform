import express from "express";
import * as controller from "./ai.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/generate", authenticate, controller.generateContent);

export default router;
