import Job from "./job.model.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const createJob = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  const slug = slugify(data.title, { lower: true, strict: true }) + "-" + Date.now();
  return Job.create({
    ...data,
    slug,
    recruiterId: user.userId,
  });
};

export const updateJob = async (jobId, data, user) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (user.role !== "ADMIN" && job.recruiterId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }

  Object.assign(job, data);
  return job.save();
};

export const deleteJob = async (jobId, user) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (user.role !== "ADMIN" && job.recruiterId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }

  await job.deleteOne();
};

export const getJobs = async (query) => {
  const filter = { status: "PUBLISHED" };

  if (query.skill) {
    filter.skillsRequired = query.skill;
  }

  if (query.location) {
    filter.location = query.location;
  }

  return Job.find(filter).sort({ createdAt: -1 });
};

export const getJobById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const job = await Job.findById(id);
    if (job) return job;
  }
  return Job.findOne({ slug: id });
};
