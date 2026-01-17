import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Typography, Button, Space, message, Card, Descriptions, Spin, Alert, Divider } from "antd";
import { PlayCircleOutlined, SendOutlined, InfoCircleOutlined, SecurityScanOutlined, WarningOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";
import challengeService from "../../../services/challengeService";
import proctoringService from "../../../services/proctoringService";

const { Title, Text, Paragraph } = Typography;

const ChallengePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const applicationId = queryParams.get("applicationId");

    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [output, setOutput] = useState("");
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const [submissionId, setSubmissionId] = useState(null);

    useEffect(() => {
        loadChallenge();
        initProctoring();
        return () => {
            if (stream) proctoringService.stopCamera(stream);
        };
    }, [id]);

    const loadChallenge = async () => {
        try {
            const data = await challengeService.getChallenge(id);
            setChallenge(data);
            setCode(data.languageTemplates?.javascript || "");
        } catch (err) {
            message.error("Failed to load challenge");
        } finally {
            setLoading(false);
        }
    };

    const initProctoring = async () => {
        try {
            const s = await proctoringService.initCamera();
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;

            proctoringService.monitorVisibility((event) => {
                message.warning("System detected tab switch! This event has been logged.");
                if (submissionId) {
                    challengeService.logProctoring(submissionId, event);
                }
            });
        } catch (err) {
            message.error("Proctoring camera required to proceed.");
        }
    };

    const handleRunCode = async () => {
        setRunning(true);
        try {
            const res = await challengeService.runCode({
                code,
                language: "javascript",
                input: challenge.testCases[0]?.input
            });
            setOutput(res.output);
        } catch (err) {
            setOutput("Execution Error: " + err.message);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!applicationId) {
            message.error("Application context missing");
            return;
        }

        setRunning(true);
        try {
            const res = await challengeService.submitChallenge({
                challengeId: id,
                applicationId,
                code,
                language: "javascript"
            });
            setSubmissionId(res._id);
            message.success(`Challenge submitted! Score: ${res.results.score}/${challenge.baseScore}`);
            setTimeout(() => navigate("/my-applications"), 3000);
        } catch (err) {
            message.error("Submission failed");
        } finally {
            setRunning(false);
        }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 100 }}><Spin size="large" /></div>;
    if (!challenge) return <Alert message="Challenge not found" type="error" />;

    return (
        <div style={{ padding: "24px", minHeight: "calc(100vh - 64px)", backgroundColor: "#141414" }}>
            <Row gutter={24} style={{ height: "100%" }}>
                {/* Left: Problem Statement & Proctoring */}
                <Col xs={24} lg={8}>
                    <Card style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#1f1f1f", border: "1px solid #303030" }}>
                        <Title level={3} style={{ color: "#fff" }}>{challenge.title}</Title>
                        <Tag color="blue">{challenge.difficulty}</Tag>
                        <Divider style={{ borderColor: "#303030" }} />
                        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, lineHeight: "1.6" }}>
                            <Paragraph style={{ color: "rgba(255,255,255,0.85)" }}>
                                {challenge.description}
                            </Paragraph>
                        </div>
                    </Card>

                    <Card
                        title={<span style={{ color: "#fff" }}><SecurityScanOutlined /> AI Proctoring Feed</span>}
                        style={{ borderRadius: 12, backgroundColor: "#1f1f1f", border: "1px solid #303030" }}
                    >
                        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#000", borderRadius: 8, overflow: "hidden" }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <div style={{ position: "absolute", bottom: 10, left: 10, padding: "4px 8px", background: "rgba(0,255,0,0.2)", borderRadius: 4, color: "#00ff00", fontSize: 12 }}>
                                • LIVE PROTECTED
                            </div>
                        </div>
                        <Alert
                            message="Monitor Active"
                            description="AI is tracking eye movement and tab switches."
                            type="info"
                            showIcon
                            style={{ marginTop: 16, backgroundColor: "rgba(0,0,0,0.3)", border: "none", color: "#aaa" }}
                        />
                    </Card>
                </Col>

                {/* Right: Code Editor & Console */}
                <Col xs={24} lg={16}>
                    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
                        <div style={{ flex: 1, borderRadius: 12, overflow: "hidden", border: "1px solid #303030" }}>
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value)}
                                options={{
                                    fontSize: 16,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                            <Space>
                                <Button
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleRunCode}
                                    loading={running}
                                    style={{ backgroundColor: "#434343", border: "none", color: "#fff" }}
                                >
                                    Run Code
                                </Button>
                            </Space>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmit}
                                loading={running}
                                style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
                            >
                                Submit Challenge
                            </Button>
                        </div>

                        <Card
                            title={<span style={{ color: "#fff" }}>Output Console</span>}
                            style={{ marginTop: 16, backgroundColor: "#1f1f1f", border: "1px solid #303030", flex: "0 0 150px" }}
                            bodyStyle={{ padding: 12, overflowY: "auto", height: "100px" }}
                        >
                            <pre style={{ color: "#00ff00", margin: 0, fontFamily: "monospace" }}>
                                {output || "> Ready to execute..."}
                            </pre>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ChallengePage;
