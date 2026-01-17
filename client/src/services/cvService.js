import http from "./http";

const cvService = {
    getMyCVs: async () => {
        return await http.get("/cvs/me");
    },

    getCV: async (id) => {
        return await http.get(`/cvs/${id}`);
    },

    createCV: async (data) => {
        return await http.post("/cvs", data);
    },

    deleteCV: async (id) => {
        return await http.delete(`/cvs/${id}`);
    }
};

export default cvService;
