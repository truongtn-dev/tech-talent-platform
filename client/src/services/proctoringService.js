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
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
            ]);
            console.log("Proctoring Models Loaded (Detector + Landmarks)");
        } catch (error) {
            console.error("Failed to load models", error);
        }
    },

    // Check for Face and Head Pose
    detectFace: async (videoElement) => {
        if (!videoElement || videoElement.paused || videoElement.ended) return null;

        // Detect all faces
        const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        
        if (!detections || detections.length === 0) {
            return { status: "NO_FACE", message: "No face detected! Please stay in frame." };
        }

        if (detections.length > 1) {
            return { status: "MULTIPLE_FACES", message: "Multiple faces detected! Only the candidate should be in frame." };
        }

        const detection = detections[0];

        // Head Pose Estimation (Simple logic based on landmarks)
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose()[3]; // Middle of nose
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[3];
        
        // Yaw (Horizontal rotation)
        const eyeCenter = (leftEye.x + rightEye.x) / 2;
        const faceWidth = rightEye.x - leftEye.x;
        const yawRatio = (nose.x - eyeCenter) / faceWidth;

        if (Math.abs(yawRatio) > 0.5) {
            return { status: "LOOKING_AWAY", message: "Looking away from screen detected!" };
        }

        return { status: "OK", message: "Face detected." };
    }
};

export default proctoringService;
