import express from "express";
import * as controller from "./upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadCV, uploadImage } from "../utils/multer.js";

const router = express.Router();

router.post("/cv", authenticate, uploadCV.single("file"), controller.uploadCV);
router.post("/image", authenticate, uploadImage.single("image"), controller.uploadImage);

router.get("/me", authenticate, controller.myUploads);
router.get("/:id", authenticate, controller.getUpload);

export default router;
