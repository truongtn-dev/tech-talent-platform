import http from "../../services/http";

const blogService = {
    getPublicBlogs: async () => {
        return await http.get("/blogs");
    },
    getBlogBySlug: async (slug) => {
        return await http.get(`/blogs/${slug}`);
    }
};

export default blogService;
