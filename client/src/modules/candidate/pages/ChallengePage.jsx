import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Space, message, Card, Spin, Alert, Tag, Tabs, Badge, Modal } from "antd";
import {
    PlayCircleOutlined,
    SendOutlined,
    SecurityScanOutlined,
    CameraOutlined,
    CodeOutlined,
    WarningOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    FileTextOutlined,
    ConsoleSqlOutlined
} from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import challengeService from "../../../services/challengeService";
import proctoringService from "../../../services/proctoringService";

const { Title, Text } = Typography;

const ChallengePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data State
    const [assignment, setAssignment] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState("");

    // UI State
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [activeTab, setActiveTab] = useState("problem");
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Proctoring State
    const [stream, setStream] = useState(null);
    const [faceAlert, setFaceAlert] = useState(null);
    const [hasStarted, setHasStarted] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        loadAssignment();
        // Init camera but don't start detection until "Start"
        initProctoring();

        // Block back navigation
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = "Leaving this page will end your test session.";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            if (stream) proctoringService.stopCamera(stream);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [id]);

    const loadAssignment = async () => {
        try {
            const data = await challengeService.getAssignment(id);
            setAssignment(data);
            if (data.challengeId) {
                setChallenge(data.challengeId);
                const defaultTemplate = `function solution(nums, target) {\n    // Write your solution here\n    return [];\n}`;
                setCode(data.submission?.code || data.challengeId.languageTemplates?.javascript || defaultTemplate);
            } else {
                message.error("Challenge data missing");
            }
        } catch (err) {
            message.error("Failed to load assignment");
        } finally {
            setLoading(false);
        }
    };

    const initProctoring = async () => {
        try {
            const s = await proctoringService.initCamera();
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
            await proctoringService.loadModels();

            proctoringService.monitorVisibility((event) => {
                if (!hasStarted) return;
                message.warning({ content: "Tab switch detected! Use Fullscreen.", key: 'proctor-warning' });
                challengeService.logProctoring(id, event).catch(console.error);
            });

            // Loop for face check
            const interval = setInterval(async () => {
                if (videoRef.current && hasStarted && !videoRef.current.paused && !videoRef.current.ended) {
                    const result = await proctoringService.detectFace(videoRef.current);
                    if (result && result.status !== "OK") {
                        setFaceAlert(result.message);
                    } else {
                        setFaceAlert(null);
                    }
                }
            }, 1000);

            return () => clearInterval(interval);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const takeSnapshot = () => {
        if (!videoRef.current || !canvasRef.current) return null;
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        return canvasRef.current.toDataURL('image/jpeg');
    };

    const handleStartTest = async () => {
        if (!stream) return message.error("Camera required to start");
        const snapshot = takeSnapshot();
        if (!snapshot) return message.error("Could not capture snapshot");

        // Force Full Screen
        toggleFullScreen();

        try {
            await challengeService.logProctoring(id, { type: "TEST_STARTED", snapshotUrl: snapshot });
            setHasStarted(true);
            message.success("Test Started. Good luck!");
        } catch (error) {
            message.error("Failed to start session");
        }
    };

    const [testResults, setTestResults] = useState(null);

    const handleRunCode = async () => {
        if (!challenge) return;
        setRunning(true);
        setActiveTab("console");
        setTestResults(null);
        setOutput("");

        try {
            const res = await challengeService.runCode({
                code,
                language: "javascript",
                challengeId: challenge._id
            });
            // Backend returns { results: [...] }
            if (res.results && Array.isArray(res.results)) {
                setTestResults(res.results);
            } else if (res.output) {
                setOutput(res.output);
            }
        } catch (err) {
            setOutput("Execution Error: " + err.message);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        Modal.confirm({
            title: "Submit Assessment?",
            content: "Are you sure you want to finish? You cannot return.",
            okText: "Submit & Finish",
            cancelText: "Cancel",
            zIndex: 10001, // Ensure modal appears above full-screen UI
            centered: true,
            onOk: async () => {
                setRunning(true);
                try {
                    const res = await challengeService.submitChallenge({
                        assignmentId: id,
                        code,
                        language: "javascript"
                    });
                    if (document.fullscreenElement) document.exitFullscreen();
                    message.success(`Submitted! Score: ${res.result.score}`);
                    navigate("/my-applications");
                } catch (err) {
                    console.error("Submission Error:", err);
                    const msg = err.response?.data?.message || err.message || "Submission failed";
                    message.error(msg);
                } finally {
                    setRunning(false);
                }
            }
        });
    };

    // --- Loading View ---
    if (loading) return (
        <div style={{ position: "fixed", inset: 0, background: "#1e1e1e", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
            <Spin size="large" tip="Loading Environment..." />
        </div>
    );

    // --- LOBBY VIEW ---
    if (!hasStarted) {
        return (
            <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
                <Card
                    style={{ width: 600, background: "#1f1f1f", border: "1px solid #333", color: "#e0e0e0", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                    bordered={false}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                        <div style={{ width: 64, height: 64, background: "rgba(237, 27, 47, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                            <SecurityScanOutlined style={{ fontSize: 32, color: "#ED1B2F" }} />
                        </div>
                        <Title level={2} style={{ color: "#fff", margin: 0 }}>System Check</Title>
                        <Text style={{ color: "#888", marginTop: 8 }}>Verify your face visibility to begin.</Text>
                    </div>

                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 12, overflow: "hidden", marginBottom: 32, border: stream ? "2px solid #333" : "none" }}>
                        <video
                            ref={(el) => { if (el && stream) el.srcObject = stream; videoRef.current = el; }}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                        />
                        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
                        {!stream && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#666" }}>
                                <CameraOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                <span>Initializing Camera...</span>
                            </div>
                        )}
                    </div>

                    <Button
                        type="primary"
                        block
                        size="large"
                        onClick={handleStartTest}
                        disabled={!stream}
                        style={{ height: 56, background: "#ED1B2F", borderColor: "#ED1B2F", fontSize: 18, fontWeight: 600, borderRadius: 8 }}
                    >
                        Enter Fullscreen Assessment
                    </Button>
                </Card>
            </div>
        );
    }

    // --- MAIN IDE VIEW (Full Screen Overlay) ---
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#1e1e1e", display: "flex", flexDirection: "column", zIndex: 10000 }}>
            <style>{`
                .ide-tabs .ant-tabs-nav { margin-bottom: 0; padding: 0 16px; border-bottom: 1px solid #333; }
                .ide-tabs .ant-tabs-tab { color: #888; padding: 12px 16px; }
                .ide-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #fff !important; text-shadow: 0 0 10px rgba(255,255,255,0.2); }
                .ide-tabs .ant-tabs-ink-bar { background: #ED1B2F; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-thumb { background: #444; borderRadius: 3px; }
                ::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            {/* Header */}
            <header style={{ height: 56, background: "#181818", borderBottom: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <Text strong style={{ color: "#fff", fontSize: 16 }}>{challenge?.title}</Text>
                    <Tag color={challenge?.difficulty === "HARD" ? "red" : challenge?.difficulty === "MEDIUM" ? "orange" : "green"} bordered={false}>
                        {challenge?.difficulty}
                    </Tag>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#252526", padding: "4px 12px", borderRadius: 4, border: "1px solid #333" }}>
                        <div style={{ width: 8, height: 8, background: "#52c41a", borderRadius: "50%", boxShadow: "0 0 8px #52c41a" }} />
                        <Text style={{ color: "#ccc", fontSize: 12 }}>Proctoring Active</Text>
                    </div>
                    <Button
                        type="text"
                        icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        onClick={toggleFullScreen}
                        style={{ color: "#888" }}
                    />
                    <div style={{ width: 1, height: 24, background: "#333", margin: "0 8px" }} />
                    <Button
                        icon={<PlayCircleOutlined />}
                        onClick={handleRunCode}
                        loading={running}
                        style={{ background: "transparent", border: "1px solid #444", color: "#e0e0e0" }}
                    >
                        Run
                    </Button>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmit}
                        loading={running}
                        style={{ background: "#ED1B2F", borderColor: "#ED1B2F", fontWeight: 600 }}
                    >
                        Submit
                    </Button>
                </div>
            </header>

            {/* Split View */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Left Panel: Context */}
                <div style={{ width: "40%", minWidth: 400, borderRight: "1px solid #303030", display: "flex", flexDirection: "column", background: "#1f1f1f" }}>
                    <Tabs
                        className="ide-tabs"
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            { key: 'problem', label: <span><FileTextOutlined /> Description</span> },
                            { key: 'console', label: <span><ConsoleSqlOutlined /> Output</span> }
                        ]}
                    />

                    <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                        {activeTab === 'problem' ? (
                            <div style={{ padding: 24, color: "#e0e0e0", fontSize: 15, lineHeight: 1.7 }}>
                                <div dangerouslySetInnerHTML={{ __html: challenge?.description }} />
                            </div>
                        ) : (
                            <div style={{ padding: 0, height: "100%", background: "#181818", margin: 0 }}>
                                <div style={{ padding: 16 }}>
                                    {testResults ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 8 }}>
                                                <Text strong style={{ color: "#fff" }}>Execution Results</Text>
                                                <Tag color={testResults.every(r => r.passed) ? "success" : "error"}>
                                                    {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                                                </Tag>
                                            </div>
                                            {testResults.map((result, idx) => (
                                                <div key={idx} style={{ background: "#252526", borderRadius: 8, padding: 12, borderLeft: `4px solid ${result.passed ? '#52c41a' : '#ff4d4f'}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <Text style={{ color: "#e0e0e0", fontWeight: 600 }}>Test Case {idx + 1}</Text>
                                                        {result.passed ? <Tag color="green">PASS</Tag> : <Tag color="red">FAIL</Tag>}
                                                    </div>
                                                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#ccc', display: 'grid', gridTemplateColumns: '80px 1fr', gap: 6 }}>
                                                        <span style={{ color: "#888" }}>Input:</span>
                                                        <span style={{ color: "#fff" }}>{result.input}</span>

                                                        <span style={{ color: "#888" }}>Expected:</span>
                                                        <span style={{ color: "#52c41a" }}>{result.expected}</span>

                                                        <span style={{ color: "#888" }}>Actual:</span>
                                                        <span style={{ color: result.passed ? "#52c41a" : "#ff4d4f" }}>{result.actual}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            <Text style={{ color: "#aaa", fontSize: 13 }}>Standard Output:</Text>
                                            <pre style={{ marginTop: 8, color: output.startsWith("Error") ? "#ff4d4f" : "#52c41a", fontFamily: "monospace", fontSize: 14 }}>
                                                {output || "> Press 'Run' to execute code against test cases."}
                                            </pre>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Proctoring Sticky Footer */}
                    <div style={{ padding: 16, borderTop: "1px solid #303030", background: "#252526" }}>
                        <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ width: 120, height: 90, background: "#000", borderRadius: 4, overflow: "hidden", position: "relative", border: faceAlert ? "2px solid #ff4d4f" : "1px solid #444" }}>
                                <video
                                    ref={(el) => { if (el && stream) el.srcObject = stream; videoRef.current = el; }}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                                />
                                {faceAlert && <div style={{ position: "absolute", inset: 0, border: "2px solid #ff4d4f" }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <Text strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>Webcam Check</Text>
                                {faceAlert ? (
                                    <Alert message={faceAlert} type="error" showIcon style={{ padding: "4px 8px", background: "rgba(255,77,79,0.1)", border: "1px solid #5a1012" }} />
                                ) : (
                                    <Text style={{ color: "#888", fontSize: 13 }}>Status: <span style={{ color: "#52c41a" }}>OK</span>. AI is monitoring session integrity.</Text>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Code Editor */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
                    <div style={{ padding: "8px 16px", background: "#1f1f1f", borderBottom: "1px solid #303030", color: "#888", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                        <span><CodeOutlined /> solution.js</span>
                        <span>JavaScript</span>
                    </div>
                    <Editor
                        height="100%"
                        defaultLanguage="javascript"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontSize: 15,
                            lineHeight: 24,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChallengePage;
