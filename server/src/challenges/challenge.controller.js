import * as service from "./challenge.service.js";

export const getAllChallenges = async (req, res) => {
    try {
        // Pass user context if authenticated (from optional authenticate middleware)
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const challenges = await service.getAllChallenges(userId, userRole);
        res.json(challenges);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const createChallenge = async (req, res) => {
    try {
        const challenge = await service.createChallenge(req.body, req.user.userId, req.user.role);
        res.status(201).json(challenge);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateChallenge = async (req, res) => {
    try {
        const challenge = await service.updateChallenge(req.params.id, req.body, req.user.userId, req.user.role);
        res.json(challenge);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteChallenge = async (req, res) => {
    try {
        await service.deleteChallenge(req.params.id, req.user.userId, req.user.role);
        res.json({ message: "Challenge deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getChallengeDetails = async (req, res) => {
    try {
        const challenge = await service.getChallengeDetails(req.params.id);
        res.json(challenge);
    } catch (err) {
        res.status(404).json({ message: "Challenge not found" });
    }
};

export const getTestAssignment = async (req, res) => {
    try {
        const assignment = await service.getTestAssignment(req.params.id);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        // Security check: ensure user owns this assignment
        if (assignment.candidateId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized access to this test" });
        }
        res.json(assignment);
    } catch (err) {
        res.status(400).json({ message: "Error fetching assignment" });
    }
};

export const runCode = async (req, res) => {
    try {
        const { code, language, challengeId } = req.body;
        const results = await service.runCode(code, language, challengeId);
        res.json({ results }); // Returning array of results
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const submitChallenge = async (req, res) => {
    try {
        const submission = await service.submitChallenge(req.body, req.user);
        res.status(201).json(submission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const logProctoring = async (req, res) => {
    try {
        const { type, snapshotUrl } = req.body;
        const log = await service.logProctoringEvent(req.params.submissionId, { type, snapshotUrl });
        res.json(log);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
