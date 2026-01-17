import http from "./http";

const applicationService = {
    // Get all applications for the current candidate
    getMyApplications: async () => {
        return await http.get("/applications/me");
    },

    // Apply for a job
    applyJob: async (applicationData) => {
        return await http.post("/applications", applicationData);
    },

    // Get applications for a specific job (Recruiter/Admin)
    getApplicationsByJob: async (jobId) => {
        return await http.get(`/applications/job/${jobId}`);
    },

    // Update application status (Recruiter/Admin)
    updateStatus: async (id, status) => {
        return await http.put(`/applications/${id}/status`, { status });
    },

    // Check if current user has applied for specified job
    checkApplicationStatus: async (jobId) => {
        return await http.get(`/applications/check/${jobId}`);
    }
};

export default applicationService;
