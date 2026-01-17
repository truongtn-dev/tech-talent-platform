import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            index: true,
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            default: "MEDIUM",
        },
        languageTemplates: {
            javascript: { type: String, default: "function solution(input) {\n  // write code here\n}" },
            python: { type: String, default: "def solution(input):\n    # write code here\n    pass" },
            java: { type: String, default: "public class Solution {\n    public static void main(String[] args) {\n        // write code here\n    }\n}" },
        },
        testCases: [
            {
                input: { type: String, required: true },
                expectedOutput: { type: String, required: true },
                isPublic: { type: Boolean, default: true },
            },
        ],
        timeLimit: { type: Number, default: 2000 }, // ms
        memoryLimit: { type: Number, default: 64 }, // MB
        baseScore: { type: Number, default: 100 },
    },
    { timestamps: true }
);

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
export default Challenge;
