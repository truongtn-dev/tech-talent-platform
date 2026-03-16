import Job from "./job.model.js";

export const create = async (data) => {
    return Job.create(data);
};

export const findById = async (id) => {
    return Job.findById(id);
};

export const findOne = async (filter) => {
    return Job.findOne(filter);
};

export const find = async (filter, sort = { createdAt: -1 }) => {
    return Job.find(filter).sort(sort);
};

export const updateById = async (id, data) => {
    return Job.findByIdAndUpdate(id, data, { new: true });
};

export const deleteById = async (id) => {
    return Job.findByIdAndDelete(id);
};

export const findBySlug = async (slug) => {
    return Job.findOne({ slug });
};
