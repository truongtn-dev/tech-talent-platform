import http from "../../services/http";

const jobService = {
    // Get all jobs with optional filters
    getAllJobs: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return await http.get(`/jobs${queryString ? `?${queryString}` : ""}`);
    },

    // Get job by ID
    getJobById: async (id) => {
        return await http.get(`/jobs/${id}`);
    },

    // Create new job (for recruiters)
    createJob: async (jobData) => {
        return await http.post("/jobs", jobData);
    },

    // Update job
    updateJob: async (id, jobData) => {
        return await http.put(`/jobs/${id}`, jobData);
    },

    // Delete job
    deleteJob: async (id) => {
        return await http.delete(`/jobs/${id}`);
    },
};

export default jobService;
