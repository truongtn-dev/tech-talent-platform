import express from "express";
import * as controller from "./challenge.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", controller.getAllChallenges);
router.get("/:id", authenticate, controller.getChallengeDetails);
router.post("/run", authenticate, controller.runCode);
router.post("/submit", authenticate, controller.submitChallenge);
router.post("/proctoring/:submissionId", authenticate, controller.logProctoring);

export default router;
