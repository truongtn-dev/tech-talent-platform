import Blog from "./blog.model.js";

// Public: Get published blogs
export const getPublicBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: "PUBLISHED" })
            .populate("author", "email avatar")
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "email avatar")
            .sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Create blog
export const createBlog = async (req, res) => {
    try {
        const { title, content, thumbnail, status, tags } = req.body;
        const blog = await Blog.create({
            title,
            content,
            thumbnail,
            status: status || "DRAFT",
            tags,
            author: req.user.userId
        });
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: "Failed to create blog" });
    }
};

// Admin: Update blog
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

// Admin: Delete blog
export const deleteBlog = async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};
