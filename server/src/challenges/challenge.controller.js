import * as service from "./challenge.service.js";

export const getAllChallenges = async (req, res) => {
    try {
        const challenges = await service.getAllChallenges();
        res.json(challenges);
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

export const runCode = async (req, res) => {
    try {
        const { code, language, input } = req.body;
        const output = await service.runCode(code, language, input);
        res.json({ output });
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
