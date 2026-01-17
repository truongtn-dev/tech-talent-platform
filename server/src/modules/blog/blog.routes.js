import express from "express";
import * as controller from "./blog.controller.js";
import { authenticate, authorizeRole } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 1. Specific Admin Routes (Protected) - Must be defined BEFORE parameterized routes to avoid shadowing
router.get("/admin", authenticate, authorizeRole("ADMIN"), controller.getAllBlogs);

// 2. Public Routes
router.get("/", controller.getPublicBlogs);
router.get("/:slug", controller.getBlogBySlug);

// 3. Admin CRUD Operations (Protected)
router.post("/", authenticate, authorizeRole("ADMIN"), controller.createBlog);
router.put("/:id", authenticate, authorizeRole("ADMIN"), controller.updateBlog);
router.delete("/:id", authenticate, authorizeRole("ADMIN"), controller.deleteBlog);

export default router;
