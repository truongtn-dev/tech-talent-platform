import express from "express";
import * as controller from "./blog.controller.js";
import { authenticate, authorizeRole } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", controller.getPublicBlogs);

// Admin routes (Protected)
router.use(authenticate);
router.use(authorizeRole("ADMIN"));

router.get("/admin", controller.getAllBlogs);
router.post("/", controller.createBlog);
router.put("/:id", controller.updateBlog);
router.delete("/:id", controller.deleteBlog);

export default router;
