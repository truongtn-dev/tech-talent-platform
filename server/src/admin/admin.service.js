import User from "../modules/auth/user.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import Profile from "../profiles/profile.model.js";
import bcrypt from "bcrypt";

const requireAdmin = (user) => {
  if (user.role !== "ADMIN") {
    throw new Error("Admin only");
  }
};

export const createUser = async (userData, currentUser) => {
  requireAdmin(currentUser);

  const { email, password, role } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash,
    role,
    status: "ACTIVE"
  });

  // Create default profile
  await Profile.create({
    userId: user._id,
    fullName: email.split("@")[0],
  });

  return user;
};

export const getUsers = async (user) => {
  requireAdmin(user);
  return User.find().select("-passwordHash").sort({ createdAt: -1 });
};

export const toggleUserStatus = async (userId, user) => {
  requireAdmin(user);

  const target = await User.findById(userId);
  if (!target) throw new Error("User not found");

  target.status = target.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  return target.save();
};

export const updateUser = async (userId, updateData, currentUser) => {
  requireAdmin(currentUser);
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-passwordHash");
  if (!user) throw new Error("User not found");
  return user;
};

export const deleteUser = async (userId, currentUser) => {
  requireAdmin(currentUser);
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error("User not found");
  // Also delete profile
  await Profile.deleteOne({ userId });
  return { message: "User deleted successfully" };
};

export const getJobs = async (user) => {
  requireAdmin(user);
  return Job.find().populate("recruiterId", "email").sort({ createdAt: -1 });
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
