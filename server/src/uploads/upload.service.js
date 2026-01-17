import Upload from "./upload.model.js";

export const saveUpload = async (file, user) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  return Upload.create({
    userId: user.userId,
    originalName: file.originalname,
    fileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
  });
};

export const getMyUploads = async (user) => {
  return Upload.find({ userId: user.userId }).sort({ createdAt: -1 });
};

export const getUploadById = async (id) => {
  return Upload.findById(id);
};
