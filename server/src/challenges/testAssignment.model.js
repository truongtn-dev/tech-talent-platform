import mongoose from "mongoose";

const TestAssignmentSchema = new mongoose.Schema(
    {
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            index: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
            required: true,
        },

        // Test Session State
        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "SUBMITTED", "TIMEOUT", "GRADED"],
            default: "PENDING",
        },

        startedAt: Date,
        submittedAt: Date,
        expiresAt: Date,

        // Result
        score: { type: Number, default: 0 }, // 0 - 100
        metrics: {
            runtime: Number,
            memory: Number,
            passedTestCases: Number,
            totalTestCases: Number
        },

        // Submission Content (Code)
        submission: {
            code: String,
            language: String
        }
    },
    { timestamps: true }
);

// Ensure one active assignment per challenge per application? 
// Or just generally unique per application/challenge pair
TestAssignmentSchema.index({ applicationId: 1, challengeId: 1 }, { unique: true });

export default mongoose.model("TestAssignment", TestAssignmentSchema);
