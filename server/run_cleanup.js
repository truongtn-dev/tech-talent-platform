import mongoose from "mongoose";
import dotenv from "dotenv";
import { cleanupExpiredTests } from "./src/utils/cleanup.service.js";

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for cleanup task.");
        
        const count = await cleanupExpiredTests();
        console.log(`Cleanup completed. ${count} items processed.`);
        
        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
};

run();
