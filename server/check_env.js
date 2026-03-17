import "./src/config/env.js";
console.log("GEMINI_KEY:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
console.log("MONGO:", process.env.MONGO_URI ? "PRESENT" : "MISSING");
process.exit(0);
