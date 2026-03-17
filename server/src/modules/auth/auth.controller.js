import * as authService from "./auth.service.js";
import User from "./user.model.js";
import Job from "../../jobs/job.model.js";
import Profile from "../../profiles/profile.model.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    let avatar = "";
    if (req.file) {
      avatar = req.file.path.startsWith("http")
        ? req.file.path
        : `${req.get("x-forwarded-proto") || req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }

    const user = await authService.register({ email, password, role, avatar, firstName, lastName });

    res.status(201).json({
      message: "Register success",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    let avatar = "";
    if (req.file) {
      avatar = req.file.path.startsWith("http")
        ? req.file.path
        : `${req.get("x-forwarded-proto") || req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, "/")}`;
    }
    if (!avatar) throw new Error("No file uploaded");

    const user = await authService.updateAvatar(req.user.userId, avatar);
    res.json({ message: "Avatar updated", avatar: user.avatar });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    await authService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const seedData = async (req, res) => {
  try {
    // ===== PASSWORD =====
    const hashedPassword = await bcrypt.hash("Techtalent123@", 10);

    // ===== CLEAN & CREATE =====
    await User.deleteMany({ email: { $in: ["admin@tech.com", "recruiter@tech.com", "candidate@tech.com"] } });
    
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

    await Profile.create({
      userId: candidate._id,
      skills: ["JavaScript", "Node.js", "MongoDB", "React"],
      experienceYears: 2,
      summary: "Junior full-stack developer with MERN experience",
    });

    await Job.create({
      recruiterId: recruiter._id,
      title: "Junior MERN Stack Developer",
      company: "Tech Talent Corp",
      description: "Looking for a junior MERN developer with basic backend and frontend skills.",
      skills: ["JavaScript", "Node.js", "MongoDB"],
      level: "JUNIOR",
      location: "Ho Chi Minh City",
      status: "PUBLISHED",
    });

    res.json({ 
      message: "Database Seeded Successfully! (Version 1.1)", 
      accounts: {
        admin: "admin@tech.com / Techtalent123@",
        recruiter: "recruiter@tech.com / Techtalent123@",
        candidate: "candidate@tech.com / Techtalent123@"
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Seed failed: " + err.message });
  }
};
