import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
    {
        interviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            index: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["EASY", "MEDIUM", "HARD"],
            default: "MEDIUM",
        },
        category: { type: String, default: "Coding" }, // e.g., Algorithm, Database, UI

        // For candidate view
        sampleInput: { type: String },
        sampleOutput: { type: String },

        // For automated evaluation
        testCases: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true },
                isHidden: { type: Boolean, default: true },
            },
        ],

        timeLimit: { type: Number, default: 1000 }, // ms
        memoryLimit: { type: Number, default: 256 }, // MB
    },
    { timestamps: true }
);

export default mongoose.model("Question", QuestionSchema);
