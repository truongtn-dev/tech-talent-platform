import * as service from "./recruiter.service.js";

export const getMyJobs = async (req, res) => {
    try {
        const jobs = await service.getMyJobs(req.user.userId);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const createJob = async (req, res) => {
    try {
        const job = await service.createJob(req.body, req.user.userId);
        res.status(201).json(job);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const job = await service.updateJob(req.params.id, req.body, req.user.userId);
        res.json(job);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteJob = async (req, res) => {
    try {
        await service.deleteJob(req.params.id, req.user.userId);
        res.json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const apps = await service.getMyApplications(req.user.userId);
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const app = await service.updateApplicationStatus(req.params.id, status, req.user.userId);
        res.json(app);
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

export const scheduleInterview = async (req, res) => {
    try {
        const interview = await service.scheduleInterview(req.body, req.user.userId);
        res.status(201).json(interview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateInterview = async (req, res) => {
    try {
        const interview = await service.updateInterview(req.params.id, req.body, req.user.userId);
        res.json(interview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteInterview = async (req, res) => {
    try {
        await service.deleteInterview(req.params.id, req.user.userId);
        res.json({ message: "Interview cancelled" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
