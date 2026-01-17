import * as service from "./cv.service.js";

export const createCV = async (req, res) => {
  const cv = await service.createCV(req.body, req.user);
  res.status(201).json(cv);
};

export const myCVs = async (req, res) => {
  const cvs = await service.getMyCVs(req.user);
  res.json(cvs);
};

export const getCV = async (req, res) => {
  const cv = await service.getCVById(req.params.id);
  res.json(cv);
};

export const deleteCV = async (req, res) => {
  await service.deleteCV(req.params.id, req.user);
  res.json({ message: "CV deleted" });
};
