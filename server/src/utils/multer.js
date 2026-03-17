import "../config/env.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";

// Configure Cloudinary
const mask = (str) => {
  if (!str) return "MISSING";
  return str.substring(0, 3) + "..." + str.substring(str.length - 3);
};

console.log("Cloudinary Config Check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: mask(process.env.CLOUDINARY_API_KEY),
  api_secret: mask(process.env.CLOUDINARY_API_SECRET),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage for CVs (PDF, DOC, DOCX)
const cvStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tech-talent-platform/cvs",
    resource_type: "raw", // Required for PDF/DOCX to be stored as files
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

export const uploadCV = multer({
  storage: cvStorage,
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

