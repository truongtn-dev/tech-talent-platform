import * as jobRepository from "./job.repository.js";
import slugify from "slugify";
import mongoose from "mongoose";

export const createJob = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  const slug = slugify(data.title, { lower: true, strict: true }) + "-" + Date.now();
  return jobRepository.create({
    ...data,
    slug,
    recruiterId: user.userId,
  });
};

export const updateJob = async (jobId, data, user) => {
  const job = await jobRepository.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (user.role !== "ADMIN" && job.recruiterId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }

  return jobRepository.updateById(jobId, data);
};

export const deleteJob = async (jobId, user) => {
  const job = await jobRepository.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (user.role !== "ADMIN" && job.recruiterId.toString() !== user.userId) {
    throw new Error("Permission denied");
  }

  await jobRepository.deleteById(jobId);
};

export const getJobs = async (query) => {
  const filter = { status: "PUBLISHED" };

  if (query.skill) {
    filter.skills = query.skill;
  }

  if (query.location) {
    filter.location = query.location;
  }

  return jobRepository.find(filter);
};

export const getJobById = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const job = await jobRepository.findById(id);
    if (job) return job;
  }
  return jobRepository.findBySlug(id);
};
