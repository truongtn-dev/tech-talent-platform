import vm from "vm";
import Challenge from "./challenge.model.js";
import Submission from "./submission.model.js";
import Application from "../applications/application.model.js";
import TestAssignment from "./testAssignment.model.js";
import { emitToUser } from "../utils/socket.js";
import { createNotification } from "../notifications/notification.service.js";

// Duplicate import removed

export const getChallengeDetails = async (id) => {
    return await Challenge.findById(id);
};

export const getTestAssignment = async (id) => {
    return await TestAssignment.findById(id).populate("challengeId");
};

export const getAllChallenges = async (userId, userRole) => {
    // If userId provided, filter to show user's challenges + public challenges
    // Otherwise return all public challenges
    let query = {};

    if (userId && userRole) {
        if (userRole === "ADMIN") {
            // Admins see all challenges
            query = {};
        } else if (userRole === "RECRUITER") {
            // Recruiters see their own + public
            query = { $or: [{ createdBy: userId }, { isPublic: true }] };
        } else {
            // Others see only public
            query = { isPublic: true };
        }
    } else {
        // Default: public only
        query = { isPublic: true };
    }

    return await Challenge.find(query).select("title difficulty baseScore isPublic createdBy").populate("createdBy", "email");
};

export const createChallenge = async (data, userId, userRole) => {
    // Only admins can create public challenges
    const isPublic = userRole === "ADMIN" && data.isPublic === true;

    return await Challenge.create({
        ...data,
        createdBy: userId,
        isPublic
    });
};

export const updateChallenge = async (id, data, userId, userRole) => {
    const challenge = await Challenge.findById(id);
    if (!challenge) throw new Error("Challenge not found");

    // Permission check: Admins can edit all, Recruiters can only edit their own
    if (userRole !== "ADMIN" && challenge.createdBy.toString() !== userId) {
        throw new Error("Unauthorized: You can only edit your own challenges");
    }

    // Only admins can change isPublic status
    if (userRole !== "ADMIN") {
        delete data.isPublic;
    }

    Object.assign(challenge, data);
    return await challenge.save();
};

export const deleteChallenge = async (id, userId, userRole) => {
    const challenge = await Challenge.findById(id);
    if (!challenge) throw new Error("Challenge not found");

    // Permission check: Admins can delete all, Recruiters can only delete their own
    if (userRole !== "ADMIN" && challenge.createdBy.toString() !== userId) {
        throw new Error("Unauthorized: You can only delete your own challenges");
    }

    return await challenge.deleteOne();
};

export const runCode = async (code, language, challengeId) => {
    if (language !== "javascript") {
        throw new Error("Currently only JavaScript is supported for execution");
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");

    const context = vm.createContext({ console });
    const results = [];

    let index = 0;
    for (const testCase of challenge.testCases) {
        const isHidden = index >= 2;
        index++;

        // Extract variable names from "nums = [...], target = 9"
        // Regex matches strictly "VARIABLE ="
        const paramNames = (testCase.input.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g) || [])
            .map(s => s.replace('=', '').trim());

        const wrappedCode = `
          ${code}
          // Auto-alias 'twoSum' to 'solution' for compatibility
          if (typeof solution === 'undefined' && typeof twoSum === 'function') {
              var solution = twoSum;
          }

          if (typeof solution === 'undefined') {
              throw new Error("Function 'solution' or 'twoSum' is not defined.");
          }

          // Execute the input assignments directly to define variables
          // We wrap in a block to ensure scope is managed if using let/const (but inputs are usually globals in this context)
          ${testCase.input};
          
          // Call solution with the extracted parameter names
          solution(${paramNames.join(', ')});
        `;

        try {
            const script = new vm.Script(wrappedCode);
            const sandbox = vm.createContext({ console });

            const output = script.runInContext(sandbox, { timeout: 1000 });

            // Normalize results
            // actual: we stringify the JS result (e.g., [0,1] -> "[0,1]")
            const actual = JSON.stringify(output);

            // expected: comes from DB as string "[0,1]". We TRIM it.
            // We assume DB stores JSON-stringified format for array/object results.
            const normalizedExpected = testCase.expectedOutput.trim();

            if (isHidden) {
                results.push({
                    input: "Hidden Case",
                    expected: "Hidden",
                    actual: "Hidden",
                    passed: actual === normalizedExpected,
                    isHidden: true
                });
            } else {
                results.push({
                    input: testCase.input,
                    expected: normalizedExpected,
                    actual: actual || "undefined",
                    passed: actual === normalizedExpected,
                    isHidden: false
                });
            }
        } catch (error) {
            if (isHidden) {
                results.push({
                    input: "Hidden Case",
                    expected: "Hidden",
                    actual: "Runtime Error",
                    passed: false,
                    isHidden: true
                });
            } else {
                results.push({
                    input: testCase.input,
                    expected: testCase.expectedOutput,
                    actual: `Error: ${error.message}`,
                    passed: false,
                    isHidden: false
                });
            }
        }
    }

    return results;
};

export const submitChallenge = async (submissionData, user) => {
    // 1. Validate Assignment
    // We expect assignmentId or we derive it from applicationId
    const { assignmentId, code, language } = submissionData;

    // Find assignment
    const assignment = await TestAssignment.findById(assignmentId)
        .populate("challengeId")
        .populate("applicationId");

    if (!assignment) throw new Error("Test Assignment not found");
    if (assignment.candidateId.toString() !== user.userId) throw new Error("Unauthorized");
    if (assignment.status === "SUBMITTED" || assignment.status === "GRADED") {
        throw new Error("Test already submitted");
    }

    const challenge = assignment.challengeId;
    if (!challenge) throw new Error("Challenge data missing");

    const results = {
        testCasesPassed: 0,
        totalTestCases: challenge.testCases.length,
        score: 0,
        executionTime: 0, // We can sum this up if runCode returns it, else 0
    };

    // 2. Run Test Cases (reuse the robust runCode logic)
    // pass challenge._id to runCode which handles fetching and iterating
    const execResults = await runCode(code, language, challenge._id);

    results.totalTestCases = execResults.length;
    results.testCasesPassed = execResults.filter(r => r.passed).length;
    results.score = Math.round((results.testCasesPassed / results.totalTestCases) * challenge.baseScore);

    // (Optional) We could log detailed per-case results if we wanted to store them in submission
    // submission.result.details = execResults; (? schema dependent)

    // 3. Save Submission
    const submission = await Submission.create({
        challengeId: challenge._id,
        candidateId: user.userId,
        applicationId: assignment.applicationId._id,
        code,
        language,
        result: results, // schema uses 'result' object? Checking schema... yes 'result'
        status: "COMPLETED",
    });

    // 4. Update Assignment
    assignment.status = "GRADED";
    assignment.submittedAt = new Date();
    assignment.score = results.score;
    assignment.submission = { code, language };
    await assignment.save();

    // 5. Update Application Status
    const app = await Application.findById(assignment.applicationId._id).populate("jobId");
    if (app) {
        app.status = "TEST_SUBMITTED";
        app.score.codingTest = results.score; // Consolidate score
        app.history.push({
            status: "TEST_SUBMITTED",
            updatedBy: user.userId,
            note: `Test Score: ${results.score}`,
            at: new Date()
        });
        await app.save();

        // Notify recruiter
        const notifData = {
            userId: app.jobId.recruiterId.toString(),
            title: "Technical Test Submitted",
            message: `Candidate ${user.email} finished test for ${app.jobId.title} (Score: ${results.score})`,
            type: "TEST_SUBMITTED",
            link: `/recruiter/applications/${app._id}`
        };
        await createNotification(notifData);
        emitToUser(app.jobId.recruiterId.toString(), "NEW_NOTIFICATION", notifData);

        // Notify candidate about their test result
        const candidateNotif = {
            userId: app.candidateId.toString(),
            title: "Test Completed",
            message: `Your coding challenge for ${app.jobId.title} has been submitted! Score: ${results.score}/${challenge.baseScore}`,
            type: "TEST_RESULT",
            link: `/my-applications`
        };
        await createNotification(candidateNotif);
        emitToUser(app.candidateId.toString(), "NEW_NOTIFICATION", candidateNotif);
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
