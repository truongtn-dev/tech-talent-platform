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

  const { email, password, role, avatar, firstName, lastName, phone, skills, bio, location, headline } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    passwordHash,
    role,
    avatar: avatar || "",
    status: "ACTIVE"
  });

  // Create profile with full details
  await Profile.create({
    userId: user._id,
    firstName: firstName || "",
    lastName: lastName || "",
    fullName: (firstName && lastName) ? `${firstName} ${lastName}` : email.split("@")[0],
    phone: phone || "",
    skills: skills || [],
    summary: bio || "",
    location: location || "",
    headline: headline || ""
  });

  return user;
};

export const getUsers = async (user) => {
  requireAdmin(user);
  // Efficiently fetch users and their profiles
  // Since Profile has ref to User, but User doesn't have ref to Profile, standard population is hard without virtuals.
  // We will do a 2-step fetch or use aggregate.
  // Aggregate is best.

  const users = await User.aggregate([
    {
      $lookup: {
        from: "profiles",
        localField: "_id",
        foreignField: "userId",
        as: "profile"
      }
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    { $project: { passwordHash: 0 } }, // Exclude hash
    { $sort: { createdAt: -1 } }
  ]);

  // Transform to flat structure if needed, or keeping it nested is fine. 
  // Client expects: user.firstName, user.lastName.
  // Let's flatten the profile fields into the user object for compatibility.
  return users.map(u => ({
    ...u,
    firstName: u.profile?.firstName,
    lastName: u.profile?.lastName,
    phone: u.profile?.phone,
    skills: u.profile?.skills,
    bio: u.profile?.summary,
    location: u.profile?.location,
    headline: u.profile?.headline
  }));
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

  const { email, role, avatar, status, firstName, lastName, phone, skills, bio, location, headline } = updateData;

  // Update User fields
  const user = await User.findByIdAndUpdate(userId, { email, role, avatar, status }, { new: true }).select("-passwordHash");
  if (!user) throw new Error("User not found");

  // Update Profile fields
  const profileFields = {};
  if (firstName !== undefined) profileFields.firstName = firstName;
  if (lastName !== undefined) profileFields.lastName = lastName;
  if (firstName || lastName) profileFields.fullName = `${firstName || ""} ${lastName || ""}`.trim();
  if (phone !== undefined) profileFields.phone = phone;
  if (skills !== undefined) profileFields.skills = skills;
  if (bio !== undefined) profileFields.summary = bio; // 'bio' from form maps to 'summary' in model
  if (location !== undefined) profileFields.location = location;
  if (headline !== undefined) profileFields.headline = headline;

  // Update or Create profile if not exists
  await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: profileFields },
    { new: true, upsert: true }
  );

  return user;
};

export const deleteUser = async (userId, currentUser) => {
  requireAdmin(currentUser);
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") throw new Error("Cannot delete Admin user");

  await User.findByIdAndDelete(userId);
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

export const createJob = async (jobData, user) => {
  requireAdmin(user);
  // Default to Admin as recruiter if not specified.
  // Using user.userId from JWT payload
  const job = await Job.create({
    ...jobData,
    recruiterId: user.userId
  });
  return job;
};

export const updateJob = async (jobId, jobData, user) => {
  requireAdmin(user);
  const job = await Job.findByIdAndUpdate(jobId, jobData, { new: true });
  if (!job) throw new Error("Job not found");
  return job;
};

export const deleteJob = async (jobId, user) => {
  requireAdmin(user);
  const job = await Job.findByIdAndDelete(jobId);
  if (!job) throw new Error("Job not found");
  return { message: "Job deleted successfully" };
};

export const dashboardStats = async (user) => {
  requireAdmin(user);

  const [users, jobs, applications, candidates, recruiters, pendingJobs] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: "CANDIDATE" }),
    User.countDocuments({ role: "RECRUITER" }),
    Job.countDocuments({ status: "PENDING" }),
  ]);

  return {
    totalUsers: users,
    totalJobs: jobs,
    totalApplications: applications,
    totalCandidates: candidates || 0,
    totalRecruiters: recruiters || 0,
    pendingJobs: pendingJobs || 0,
  };
};

export const getApplications = async (user) => {
  requireAdmin(user);
  return Application.find()
    .populate("jobId", "title")
    .populate("candidateId", "email")
    .sort({ createdAt: -1 });
};
