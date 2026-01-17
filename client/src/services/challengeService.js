import http from "./http";

const challengeService = {
    getChallenge: async (id) => {
        return await http.get(`/challenges/${id}`);
    },

    runCode: async (data) => {
        return await http.post("/challenges/run", data);
    },

    submitChallenge: async (data) => {
        return await http.post("/challenges/submit", data);
    },

    logProctoring: async (submissionId, data) => {
        return await http.post(`/challenges/proctoring/${submissionId}`, data);
    }
};

export default challengeService;
