import http from "./http";

const aiService = {
    generateContent: async ({ type, data }) => {
        return await http.post("/ai/generate", { type, data });
    },
};

export default aiService;
