import http from "./http";

const challengeService = {
    getAll: async () => {
        return await http.get("/challenges");
    },

    getChallenge: async (id) => {
        return await http.get(`/challenges/${id}`);
    },

    getAssignment: async (id) => {
        return await http.get(`/challenges/assignment/${id}`);
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
