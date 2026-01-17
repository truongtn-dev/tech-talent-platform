import * as service from "./upload.service.js";

export const uploadCV = async (req, res) => {
  try {
    const upload = await service.saveUpload(req.file, req.user);
    res.status(201).json(upload);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const myUploads = async (req, res) => {
  const uploads = await service.getMyUploads(req.user);
  res.json(uploads);
};

export const getUpload = async (req, res) => {
  const file = await service.getUploadById(req.params.id);
  res.json(file);
};
