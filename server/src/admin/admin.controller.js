import * as service from "./admin.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await service.getUsers(req.user);
    res.json(users);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await service.createUser(req.body, req.user);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await service.toggleUserStatus(req.params.id, req.user);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await service.updateUser(req.params.id, req.body, req.user);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await service.deleteUser(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await service.getJobs(req.user);
    res.json(jobs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const approveJob = async (req, res) => {
  try {
    const job = await service.approveJob(req.params.id, req.user);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const hideJob = async (req, res) => {
  try {
    const job = await service.hideJob(req.params.id, req.user);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = await service.createJob(req.body, req.user);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await service.updateJob(req.params.id, req.body, req.user);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const result = await service.deleteJob(req.params.id, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const dashboard = async (req, res) => {
  try {
    const stats = await service.dashboardStats(req.user);
    res.json(stats);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const applications = await service.getApplications(req.user);
    res.json(applications);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
