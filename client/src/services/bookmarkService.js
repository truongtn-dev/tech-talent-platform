import http from "./http";

const bookmarkService = {
    addBookmark: async (jobId) => {
        return await http.post("/bookmarks", { jobId });
    },

    removeBookmark: async (jobId) => {
        return await http.delete(`/bookmarks/${jobId}`);
    },

    getMyBookmarks: async () => {
        return await http.get("/bookmarks/me");
    },

    checkBookmark: async (jobId) => {
        return await http.get(`/bookmarks/check/${jobId}`);
    }
};

export default bookmarkService;
