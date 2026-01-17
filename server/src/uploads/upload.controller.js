import * as service from "./upload.service.js";

export const uploadCV = async (req, res) => {
  try {
    const upload = await service.saveUpload(req.file, req.user);
    res.status(201).json(upload);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    // Construct full URL for local storage
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/${req.file.path.replace(/\\/g, "/")}`;

    res.status(201).json({ url, ...req.file });
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
