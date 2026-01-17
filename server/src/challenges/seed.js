import "../config/env.js";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Challenge from "./challenge.model.js";

const challenges = [
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        difficulty: "EASY",
        languageTemplates: {
            javascript: "function solution(nums, target) {\n  // your code here\n}",
        },
        testCases: [
            { input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]", isPublic: true },
            { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]", isPublic: true },
        ],
        baseScore: 100,
    },
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        difficulty: "EASY",
        languageTemplates: {
            javascript: "function solution(x) {\n  // your code here\n}",
        },
        testCases: [
            { input: "121", expectedOutput: "true", isPublic: true },
            { input: "-121", expectedOutput: "false", isPublic: true },
            { input: "10", expectedOutput: "false", isPublic: true },
        ],
        baseScore: 100,
    }
];

const seedChallenges = async () => {
    try {
        await connectDB();
        await Challenge.deleteMany({});
        await Challenge.insertMany(challenges);
        console.log("Challenges seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding challenges:", error);
        process.exit(1);
    }
};

seedChallenges();
