import User from "../modules/auth/user.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";

const requireAdmin = (user) => {
  if (user.role !== "ADMIN") {
    throw new Error("Admin only");
  }
};

export const getUsers = async (user) => {
  requireAdmin(user);
  return User.find().select("-passwordHash").sort({ createdAt: -1 });
};

export const toggleUserStatus = async (userId, user) => {
  requireAdmin(user);

  const target = await User.findById(userId);
  if (!target) throw new Error("User not found");

  target.isActive = !target.isActive;
  return target.save();
};

export const approveJob = async (jobId, user) => {
  requireAdmin(user);

  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  job.status = "PUBLISHED";
  return job.save();
};

export const hideJob = async (jobId, user) => {
  requireAdmin(user);

  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  job.status = "CLOSED";
  return job.save();
};

export const dashboardStats = async (user) => {
  requireAdmin(user);

  const [users, jobs, applications] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
  ]);

  return {
    totalUsers: users,
    totalJobs: jobs,
    totalApplications: applications,
  };
};
