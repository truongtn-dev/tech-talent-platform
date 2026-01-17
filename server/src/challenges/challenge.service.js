import vm from "vm";
import Challenge from "./challenge.model.js";
import Submission from "./submission.model.js";
import Application from "../applications/application.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";

export const getChallengeDetails = async (id) => {
    return await Challenge.findById(id);
};

export const getAllChallenges = async () => {
    return await Challenge.find().select("title difficulty");
};

export const runCode = async (code, language, input) => {
    if (language !== "javascript") {
        throw new Error("Currently only JavaScript is supported for execution");
    }

    const script = new vm.Script(code);
    const context = vm.createContext({ console });

    try {
        // In a real prod env, we'd use a more robust sandbox like 'vm2' or isolated-vm
        // and handle input/output more formally.
        // This is a simplified version for the prototype.
        const result = script.runInContext(context, { timeout: 2000 });
        return result;
    } catch (error) {
        return `Error: ${error.message}`;
    }
};

export const submitChallenge = async (submissionData, user) => {
    const { challengeId, applicationId, code, language } = submissionData;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const results = {
        testCasesPassed: 0,
        totalTestCases: challenge.testCases.length,
        score: 0,
        executionTime: 0,
    };

    // Run against test cases
    for (const testCase of challenge.testCases) {
        const startTime = Date.now();
        try {
            // Very simple execution logic: assumes code defines solution(input)
            const fullCode = `${code}\n solution(${testCase.input});`;
            const output = await runCode(fullCode, language, testCase.input);

            const expected = testCase.expectedOutput.trim();
            const actual = String(output).trim();

            if (actual === expected) {
                results.testCasesPassed++;
            }
        } catch (error) {
            console.error("Test Case Error:", error);
        }
        results.executionTime += (Date.now() - startTime);
    }

    results.score = Math.round((results.testCasesPassed / results.totalTestCases) * challenge.baseScore);

    const submission = await Submission.create({
        challengeId,
        candidateId: user.userId,
        applicationId,
        code,
        language,
        results,
        status: "COMPLETED",
    });

    // Update application status or score if needed
    const updatedApp = await Application.findByIdAndUpdate(applicationId, {
        status: results.score > 0 ? "SCREENED" : "APPLIED"
    }).populate("jobId");

    // Notify recruiter
    if (updatedApp) {
        const notifData = {
            userId: updatedApp.jobId.recruiterId.toString(),
            title: "Technical Test Submitted",
            message: `Candidate ${user.email} finished the test for ${updatedApp.jobId.title} (Score: ${results.score})`,
            type: "TEST_SUBMITTED",
            link: `/recruiter/applications?jobId=${updatedApp.jobId._id}`
        };
        await createNotification(notifData);
        emitToUser(updatedApp.jobId.recruiterId.toString(), "NEW_NOTIFICATION", notifData);
    }

    return submission;
};

export const logProctoringEvent = async (submissionId, event) => {
    return await Submission.findByIdAndUpdate(
        submissionId,
        {
            $push: { proctoringLogs: event },
            $set: { isFlagged: true } // Flag if any proctoring event occurs
        },
        { new: true }
    );
};
