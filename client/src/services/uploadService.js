import http from "./http";

const uploadService = {
    uploadCV: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        // Content-Type header comes automatically with FormData in axios
        return await http.post("/uploads/cv", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default uploadService;
