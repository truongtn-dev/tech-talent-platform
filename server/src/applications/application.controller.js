import * as applicationService from "./application.service.js";

export const applyJob = async (req, res) => {
  try {
    const application = await applicationService.applyJob(req.body, req.user);
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const myApplications = async (req, res) => {
  try {
    const apps = await applicationService.getApplicationsByCandidate(req.user.userId);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const applicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const apps = await applicationService.getApplicationsByJob(
      jobId,
      req.user.userId,
      req.user.role
    );
    res.json(apps);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedApp = await applicationService.updateStatus(
      id,
      status,
      req.user.userId,
      req.user.role
    );
    res.json(updatedApp);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
