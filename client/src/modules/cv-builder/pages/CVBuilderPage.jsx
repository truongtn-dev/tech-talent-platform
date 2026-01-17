import React, { useState } from "react";
import { Row, Col, Card, Steps, Button, Layout, message, Input, Modal, Spin, Typography } from "antd";
import { UserOutlined, SolutionOutlined, ProjectOutlined, DownloadOutlined, SaveOutlined, RobotOutlined } from "@ant-design/icons";
import CVForm from "../components/CVForm";
import CVPreview from "../components/CVPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import cvService from "../../../services/cvService";
import aiService from "../../../services/aiService";

const { Content } = Layout;
const { Paragraph } = Typography;

const CVBuilderPage = () => {
    const [cvData, setCvData] = useState({
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: []
    });
    const [cvTitle, setCvTitle] = useState("My CV");
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    // AI State
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiGenerate = async (type) => {
        setAiLoading(true);
        try {
            const result = await aiService.generateContent({
                type,
                data: {
                    role: cvData.title || "Professional", // Assume title exists or use generic
                    skills: cvData.skills?.map(s => s.name).join(", "),
                    experience: cvData.experience?.map(e => `${e.position} at ${e.company}`).join(", ")
                }
            });

            if (result && result.content) {
                if (type === "SUMMARY") {
                    setCvData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, summary: result.content }
                    }));
                    message.success("Summary generated!");
                    setAiModalVisible(false);
                }
            }
        } catch (error) {
            console.error("AI Error:", error);
            message.error("Failed to generate content");
        } finally {
            setAiLoading(false);
        }
    };

    const handleDataChange = (section, data) => {
        setCvData(prev => ({ ...prev, [section]: data }));
    };

    const handleAiImprove = async (path, currentText) => {
        if (!currentText) {
            message.warning("Please enter some text first for AI to improve.");
            return;
        }

        setAiLoading(true);
        try {
            const result = await aiService.generateContent({
                type: "IMPROVE_EXPERIENCE",
                data: { description: currentText }
            });

            if (result && result.content) {
                // Update deeply nested data
                // path is like ['experience', 0, 'description']
                setCvData(prev => {
                    const newData = { ...prev };
                    let current = newData;
                    for (let i = 0; i < path.length - 1; i++) {
                        current = current[path[i]];
                    }
                    current[path[path.length - 1]] = result.content;
                    return newData;
                });
                message.success("Content improved by AI!");
            }
        } catch (error) {
            console.error("AI Error:", error);
            message.error("Failed to improve content");
        } finally {
            setAiLoading(false);
        }
    };

    const handleSaveCV = async () => {
        if (!cvTitle.trim()) {
            message.error("Please enter a title for your CV");
            return;
        }
        setSaving(true);
        try {
            await cvService.createCV({
                title: cvTitle,
                data: cvData
            });
            message.success("CV saved successfully!");
        } catch (error) {
            console.error("Save failed:", error);
            message.error("Failed to save CV");
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = async () => {
        const element = document.getElementById("cv-capture");
        if (!element) return;

        setExporting(true);
        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save("my-cv.pdf");
            message.success("CV exported successfully!");
        } catch (error) {
            console.error("Export failed:", error);
            message.error("Failed to export CV");
        } finally {
            setExporting(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content style={{
                padding: "24px 50px",
                marginTop: 64,
                background: "linear-gradient(180deg, #f0f2f5 0%, #e6e9f0 100%)" // Nice subtle gradient
            }}>
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <h2 style={{ margin: 0, background: "-webkit-linear-gradient(45deg, #333, #666)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                        CV Builder
                                    </h2>
                                    <Input
                                        placeholder="CV Title (e.g. My Frontend CV)"
                                        value={cvTitle}
                                        onChange={e => setCvTitle(e.target.value)}
                                        style={{ width: 250 }}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    <Button
                                        icon={<SaveOutlined />}
                                        onClick={handleSaveCV}
                                        loading={saving}
                                    >
                                        Save Cloud
                                    </Button>
                                    <Button
                                        icon={<RobotOutlined />}
                                        onClick={() => setAiModalVisible(true)}
                                        style={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            color: "white",
                                            border: "none",
                                            boxShadow: "0 4px 15px rgba(118, 75, 162, 0.4)"
                                        }}
                                    >
                                        AI Assist
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        style={{ background: "#ED1B2F", borderColor: "#ED1B2F", boxShadow: "0 4px 15px rgba(237, 27, 47, 0.3)" }}
                                        onClick={handleExportPDF}
                                        loading={exporting}
                                    >
                                        Export PDF
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Modal
                        // ... (Modal Content Helper - keeping existing)
                        title={<span><RobotOutlined style={{ marginRight: 8, color: "#764ba2" }} />AI Assistant</span>}
                        open={aiModalVisible}
                        onCancel={() => setAiModalVisible(false)}
                        footer={null}
                    >
                        <Paragraph>Let Gemini AI help you write a better CV.</Paragraph>

                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <Card size="small" title="Generate Professional Summary" hoverable onClick={() => handleAiGenerate("SUMMARY")} style={{ cursor: "pointer", borderColor: "#d9d9d9" }}>
                                <Paragraph type="secondary" style={{ margin: 0 }}>
                                    Create a compelling summary based on your profile details.
                                </Paragraph>
                            </Card>

                            {/* Add more AI tools here in future */}
                        </div>

                        {aiLoading && (
                            <div style={{ textAlign: "center", marginTop: 24, padding: 20 }}>
                                <Spin tip="AI is thinking...">
                                    <div style={{ padding: 50 }} />
                                </Spin>
                            </div>
                        )}
                    </Modal>

                    <Col xs={24} lg={12}>
                        <Card title="Enter Your Details" style={{ minHeight: "80vh", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                            <CVForm
                                data={cvData}
                                onChange={handleDataChange}
                                onAiImprove={handleAiImprove}
                                aiLoading={aiLoading}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <div style={{ position: "sticky", top: 80 }}>
                            <Card
                                title="Live Preview"
                                style={{
                                    minHeight: "80vh",
                                    background: "#525659", // Dark background for contrast with white page
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                    border: "none",
                                    overflow: "hidden"
                                }}
                                bodyStyle={{ padding: 0, display: "flex", justifyContent: "center", background: "#525659", padding: "20px" }}
                            >
                                <div style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
                                    <CVPreview data={cvData} />
                                </div>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Content >
        </Layout >
    );
};

export default CVBuilderPage;
