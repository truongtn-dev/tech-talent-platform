import * as faceapi from '@vladmandic/face-api';

const proctoringService = {
    // Detect if user switches tab or minimizes window
    monitorVisibility: (onFlag) => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                onFlag({
                    type: "TAB_SWITCH",
                    message: "User left the assessment tab"
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    },

    // Request camera access and return stream
    initCamera: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            return stream;
        } catch (err) {
            console.error("Camera access denied:", err);
            throw new Error("Proctoring requires camera access");
        }
    },

    stopCamera: (stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    },

    // Load AI Models
    loadModels: async () => {
        try {
            // Using Tiny Face Detector for performance
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
            console.log("FaceAPI Models Loaded");
        } catch (error) {
            console.error("Failed to load models", error);
        }
    },

    // Check for Face
    detectFace: async (videoElement) => {
        if (!videoElement || videoElement.paused || videoElement.ended) return null;

        const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions());
        const faceCount = detections.length;

        if (faceCount === 0) {
            return { status: "NO_FACE", message: "No face detected in camera view!" };
        } else if (faceCount > 1) {
            return { status: "MULTIPLE_FACES", message: "Multiple faces detected. Suspicious activity." };
        }
        return { status: "OK", message: "Face detected." };
    }
};

export default proctoringService;
