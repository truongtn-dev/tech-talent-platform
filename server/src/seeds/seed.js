import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import "../config/env.js";
import connectDB from "../config/db.js";

import User from "../modules/auth/user.model.js";
import Job from "../jobs/job.model.js";
import Profile from "../profiles/profile.model.js";

const seed = async () => {
  try {
    await connectDB();

    console.log("Seeding database...");

    // ===== CLEAN OLD DATA =====
    await User.deleteMany();
    await Job.deleteMany();
    await Profile.deleteMany();

    // ===== PASSWORD =====
    const hashedPassword = await bcrypt.hash("Techtalent123@", 10);

    // ===== USERS =====
    const admin = await User.create({
      email: "admin@tech.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
    });

    const recruiter = await User.create({
      email: "recruiter@tech.com",
      passwordHash: hashedPassword,
      role: "RECRUITER",
    });

    const candidate = await User.create({
      email: "candidate@tech.com",
      passwordHash: hashedPassword,
      role: "CANDIDATE",
    });

    // ===== PROFILE (FOR AI MATCHING) =====
    const profile = await Profile.create({
      userId: candidate._id,
      skills: ["JavaScript", "Node.js", "MongoDB", "React"],
      experienceYears: 2,
      summary: "Junior full-stack developer with MERN experience",
    });

    // ===== JOB =====
    const job = await Job.create({
      recruiterId: recruiter._id,
      title: "Junior MERN Stack Developer",
      company: "Debug Corp",
      description:
        "Looking for a junior MERN developer with basic backend and frontend skills.",
      skills: ["JavaScript", "Node.js", "MongoDB"],
      level: "JUNIOR",
      location: "Ho Chi Minh City",
      status: "PUBLISHED",
      slug: "junior-mern-stack-developer-" + Date.now(),
    });

    console.log("Seed completed successfully");
    console.log("Login accounts:");
    console.log("ADMIN      -> admin@tech.com / Techtalent123@");
    console.log("RECRUITER  -> recruiter@tech.com / Techtalent123@");
    console.log("CANDIDATE  -> candidate@tech.com / Techtalent123@");
    console.log("Job ID:", job._id.toString());

    process.exit();
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
