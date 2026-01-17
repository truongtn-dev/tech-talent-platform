import express from "express";
import * as controller from "./offer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Recruiter/Admin
router.post("/", authenticate, controller.createOffer);

// Candidate
router.get("/me", authenticate, controller.myOffers);
router.put("/:id/respond", authenticate, controller.respondOffer);

export default router;
