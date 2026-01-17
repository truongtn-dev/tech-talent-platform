import http from "./http";

const authService = {
    // Enhanced to handle both JSON and FormData
    register: async (userData) => {
        // If userData is FormData, axios handles Content-Type automatically
        return await http.post("/auth/register", userData);
    },

    login: async (credentials) => {
        return await http.post("/auth/login", credentials);
    },

    updateAvatar: async (formData) => {
        return await http.put("/auth/me/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    changePassword: async (passwordData) => {
        return await http.put("/auth/me/password", passwordData);
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};

export default authService;
