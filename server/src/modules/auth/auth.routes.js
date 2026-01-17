import express from "express";
import * as authController from "./auth.controller.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

console.log("Auth routes loaded");

export default router;
