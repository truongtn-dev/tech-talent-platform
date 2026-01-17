import * as applicationService from "./application.service.js";

export const applyJob = async (req, res) => {
  try {
    const application = await applicationService.applyJob(req.body, req.user);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
