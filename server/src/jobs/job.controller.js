import * as jobService from "./job.service.js";

export const createJob = async (req, res) => {
  try {
    const jobData = { ...req.body };

    // Handle thumbnail upload
    if (req.file) {
      jobData.thumbnail = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const job = await jobService.createJob(jobData, req.user);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const jobData = { ...req.body };

    // Handle thumbnail upload
    if (req.file) {
      jobData.thumbnail = `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const job = await jobService.updateJob(req.params.id, jobData, req.user);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    await jobService.deleteJob(req.params.id, req.user);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getJobs = async (req, res) => {
  const jobs = await jobService.getJobs(req.query);
  res.json(jobs);
};

export const getJobById = async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
};
