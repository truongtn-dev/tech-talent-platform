import * as service from "./admin.service.js";

export const getUsers = async (req, res) => {
  try {
    const users = await service.getUsers(req.user);
    res.json(users);
  } catch (err) {
    res.status(403).json({ message: err.message });
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

export const dashboard = async (req, res) => {
  try {
    const stats = await service.dashboardStats(req.user);
    res.json(stats);
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};
