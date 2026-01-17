import * as service from "./interviewer.service.js";

export const getMyQuestions = async (req, res) => {
    try {
        const questions = await service.getMyQuestions(req.user.userId);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const question = await service.createQuestion(req.body, req.user.userId);
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const question = await service.updateQuestion(req.params.id, req.body, req.user.userId);
        res.json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        await service.deleteQuestion(req.params.id, req.user.userId);
        res.json({ message: "Question deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const stats = await service.getDashboardStats(req.user.userId);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getInterviews = async (req, res) => {
    try {
        const interviews = await service.getInterviews(req.user.userId);
        res.json(interviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const submitEvaluation = async (req, res) => {
    try {
        // Logically this would update the application or create an interview record
        // For simplicity, let's assume service handles it
        const result = await service.submitEvaluation(req.params.id, req.body, req.user.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateInterviewSession = async (req, res) => {
    try {
        const result = await service.updateInterviewSession(req.params.id, req.body, req.user.userId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getJobs = async (req, res) => {
    try {
        const jobs = await service.getJobs();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAvailableApplications = async (req, res) => {
    try {
        const apps = await service.getAvailableApplications();
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createInterviewSession = async (req, res) => {
    try {
        const session = await service.createInterviewSession(req.body, req.user.userId);
        res.status(201).json(session);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
