import http from "../../services/http";

const adminService = {
    // Dashboard Stats
    getStats: async () => {
        return await http.get("/admin/dashboard");
    },

    // User Management
    getAllUsers: async () => {
        return await http.get("/admin/users");
    },

    toggleUserStatus: async (userId) => {
        return await http.put(`/admin/users/${userId}/toggle`);
    },

    createUser: async (userData) => {
        return await http.post("/admin/users", userData);
    },

    updateUser: async (userId, userData) => {
        return await http.put(`/admin/users/${userId}`, userData);
    },

    deleteUser: async (userId) => {
        return await http.delete(`/admin/users/${userId}`);
    },

    // Job Moderation
    getAllJobs: async () => {
        return await http.get("/admin/jobs");
    },

    approveJob: async (jobId) => {
        return await http.put(`/admin/jobs/${jobId}/approve`);
    },

    hideJob: async (jobId) => {
        return await http.put(`/admin/jobs/${jobId}/hide`);
    },

    // Blog Management
    getBlogs: async () => {
        return await http.get('/blogs/admin');
    },
    createBlog: async (data) => {
        return await http.post('/blogs', data);
    },
    updateBlog: async (id, data) => {
        return await http.put(`/blogs/${id}`, data);
    },
    deleteBlog: async (id) => {
        return await http.delete(`/blogs/${id}`);
    },
};

export default adminService;
