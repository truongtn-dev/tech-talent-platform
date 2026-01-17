import express from "express";
import * as controller from "./cv.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Candidate
router.post("/", authenticate, controller.createCV);
router.get("/me", authenticate, controller.myCVs);
router.get("/:id", authenticate, controller.getCV);
router.delete("/:id", authenticate, controller.deleteCV);

export default router;
