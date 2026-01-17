import axios from "axios";

// Create axios instance with default config
const http = axios.create({
    baseURL: "http://localhost:5000/api", // Adjust if your server port is different
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
http.interceptors.request.use(
    (config) => {
        // You can add auth token here if available
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
http.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle global errors here
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("API Error:", error.response.data);
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Network Error:", error.request);
            return Promise.reject(new Error("Network error. Please try again."));
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error:", error.message);
            return Promise.reject(error);
        }
    }
);

export default http;
