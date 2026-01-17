import * as service from "./gemini.service.js";

export const generateContent = async (req, res) => {
    try {
        const { type, data } = req.body;
        const result = await service.generateCVContent({ type, data });
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
