import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/cvs";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Only PDF/DOC/DOCX allowed"));
  } else {
    cb(null, true);
  }
};

export const uploadCV = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const avatarDir = "uploads/avatars";
const imageDir = "uploads/images";

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, avatarDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const imageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, imageDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});



export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/webp") {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg, .jpeg and .webp format allowed!"));
    }
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

const thumbnailDir = "uploads/thumbnails";

if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

const thumbnailStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, thumbnailDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `thumbnail-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const uploadJobThumbnail = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
      cb(null, true);
    } else {
      cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
});

