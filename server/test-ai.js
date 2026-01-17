import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const run = async () => {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env or not loaded.");
        return;
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Test gemini-pro (Legacy but stable)
    try {
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing 'gemini-pro'...");
        const result = await modelPro.generateContent("Hello");
        const response = await result.response;
        console.log("Success with 'gemini-pro':", response.text());
    } catch (error) {
        console.error("Failed with gemini-pro:", error.message);
    }

    // Test gemini-1.5-flash (Standard)
    try {
        console.log("Testing 'gemini-1.5-flash'...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        const response = await resultFlash.response;
        console.log("Success with 'gemini-1.5-flash':", response.text());
    } catch (error) {
        console.error("Failed with gemini-1.5-flash:", error.message);
    }
};

run();
