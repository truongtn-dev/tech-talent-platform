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
    }
};

export default proctoringService;
