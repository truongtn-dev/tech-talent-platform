import http from "../../services/http";

const interviewerService = {
    // Dashboard Stats
    getStats: () => http.get("/interviewer/stats"),

    // Question Bank
    getQuestions: () => http.get("/interviewer/questions"),
    createQuestion: (data) => http.post("/interviewer/questions", data),
    updateQuestion: (id, data) => http.put(`/interviewer/questions/${id}`, data),
    deleteQuestion: (id) => http.delete(`/interviewer/questions/${id}`),

    // Interview Management
    getInterviews: () => http.get("/interviewer/sessions"),
    submitEvaluation: (id, data) => http.post(`/interviewer/sessions/${id}/evaluate`, data),
    updateInterviewSession: (id, data) => http.put(`/interviewer/sessions/${id}`, data),
    getAvailableApplications: () => http.get("/interviewer/available-applications"),
    createInterviewSession: (data) => http.post("/interviewer/sessions", data),

    // Job Selection
    getJobs: () => http.get("/interviewer/jobs"),
};

export default interviewerService;
