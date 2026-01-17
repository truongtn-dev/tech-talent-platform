import http from "../../services/http";

const recruiterService = {
    // Interviews
    getInterviews: async () => {
        const response = await http.get("/recruiter/interviews");
        return response; // http.js interceptor returns response.data
    },
    scheduleInterview: async (data) => {
        const response = await http.post("/recruiter/interviews", data);
        return response;
    },
    updateInterview: async (id, data) => {
        const response = await http.put(`/recruiter/interviews/${id}`, data);
        return response;
    },
    deleteInterview: async (id) => {
        const response = await http.delete(`/recruiter/interviews/${id}`);
        return response;
    },

    // Dashboard Stats
    getDashboardStats: async () => {
        const response = await http.get("/recruiter/stats");
        return response;
    },

    // Job Management
    getMyJobs: () => http.get("/recruiter/jobs"),
    createJob: (data) => http.post("/recruiter/jobs", data),
    updateJob: (id, data) => http.put(`/recruiter/jobs/${id}`, data),
    deleteJob: (id) => http.delete(`/recruiter/jobs/${id}`),

    // Application Management
    getApplications: () => http.get("/recruiter/applications"),
    updateApplicationStatus: (id, status) => http.put(`/recruiter/applications/${id}/status`, { status }),
};

export default recruiterService;
