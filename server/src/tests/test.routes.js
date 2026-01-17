import express from "express";
import * as controller from "./test.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public (list test)
router.get("/", controller.getTests);
router.get("/:id", controller.getTestById);

// Protected
router.post("/", authenticate, controller.createTest);
router.post("/submit", authenticate, controller.submitCode);

export default router;
