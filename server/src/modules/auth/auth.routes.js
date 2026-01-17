import express from "express";
import * as authController from "./auth.controller.js";

import { uploadAvatar } from "../../utils/multer.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", uploadAvatar.single("avatar"), authController.register);
router.post("/login", authController.login);
router.put("/me/avatar", authenticate, uploadAvatar.single("avatar"), authController.updateAvatar);
router.put("/me/password", authenticate, authController.changePassword);

console.log("Auth routes loaded");

export default router;
