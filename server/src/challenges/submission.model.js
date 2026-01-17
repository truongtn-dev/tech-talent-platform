import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
    {
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Challenge",
            required: true,
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },
        code: { type: String, required: true },
        language: { type: String, default: "javascript" },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        result: {
            score: { type: Number, default: 0 },
            testCasesPassed: { type: Number, default: 0 },
            totalTestCases: { type: Number, default: 0 },
            executionTime: { type: Number }, // ms
            errorMessage: { type: String },
        },
        proctoringLogs: [
            {
                type: {
                    type: String,
                    enum: ["TAB_SWITCH", "MULTIPLE_PEOPLE", "NO_PERSON", "USER_LEFT"],
                },
                timestamp: { type: Date, default: Date.now },
                snapshotUrl: { type: String }, // Optional image from camera
            },
        ],
        isFlagged: { type: Boolean, default: false }, // If proctoring detected suspicious activity
    },
    { timestamps: true }
);

const Submission = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
export default Submission;
