import Job from "./job.model.js";

export const createJob = async (data, user) => {
  if (!["RECRUITER", "ADMIN"].includes(user.role)) {
    throw new Error("Permission denied");
  }

  return Job.create({
    ...data,
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
  return Job.findById(id);
};
