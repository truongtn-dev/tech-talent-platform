import "../config/env.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";

// Configure Cloudinary
console.log("Configuring Cloudinary with:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "PRESENT" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "PRESENT" : "MISSING",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = "uploads/cvs";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Keep CVs on disk for now (or move to Cloudinary later if needed)
const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1000000000)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC/DOCX allowed"));
  }
};

export const uploadCV = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Configure Cloudinary Storage for Avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tech-talent-platform/avatars",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

// Configure Cloudinary Storage for Images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tech-talent-platform/images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Configure Cloudinary Storage for Job Thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tech-talent-platform/thumbnails",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadJobThumbnail = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

