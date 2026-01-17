import http from "./http";

const profileService = {
    getMyProfile: async () => {
        return await http.get("/profiles/me");
    },

    updateProfile: async (data) => {
        return await http.put("/profiles/me", data);
    },

    getProfileById: async (userId) => {
        return await http.get(`/profiles/${userId}`);
    }
};

export default profileService;
