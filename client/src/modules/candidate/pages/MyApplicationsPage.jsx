import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, Empty, Button, Steps, Tag, Row, Col, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import applicationService from "../../../services/applicationService";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    EnvironmentOutlined,
    BankOutlined,
    FileTextOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const data = await applicationService.getMyApplications();
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status) => {
        const statuses = ["APPLIED", "SCREENED", "TEST_SENT", "INTERVIEW", "OFFER"];
        const index = statuses.indexOf(status);
        if (index === -1) {
            if (status === "REJECTED") return 0; // Or handle differently
            return 0;
        }
        return index;
    };

    const getStatusStatus = (status) => {
        if (status === "REJECTED") return "error";
        if (status === "OFFER") return "finish";
        return "process";
    };

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            {/* Header Banner */}
            <div style={{
                height: 220,
                background: "linear-gradient(135deg, #1f1f1f 0%, #ED1B2F 100%)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 24px"
            }}>
                <div className="container" style={{ maxWidth: 1000, margin: "0 auto", width: "100%" }}>
                    <Title level={1} style={{ color: "white", margin: "0 0 8px 0", fontWeight: 700 }}>My Applications</Title>
                    <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: 0 }}>
                        Track and manage your job application status
                    </Paragraph>
                </div>
            </div>

            <div className="container" style={{ maxWidth: 1000, margin: "-60px auto 40px", padding: "0 24px", position: "relative" }}>
                {loading ? (
                    <Card style={{ borderRadius: 12, padding: 80, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                        <Spin size="large" />
                    </Card>
                ) : applications.length === 0 ? (
                    <Card style={{ borderRadius: 12, padding: 60, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                        <Empty
                            description={
                                <span style={{ fontSize: 16, color: "#595959" }}>
                                    You haven't applied to any jobs yet.
                                </span>
                            }
                        >
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate("/jobs")}
                                style={{
                                    marginTop: 24,
                                    backgroundColor: "#ED1B2F",
                                    borderColor: "#ED1B2F",
                                    height: 48,
                                    padding: "0 32px",
                                    fontSize: 16,
                                    borderRadius: 8
                                }}
                            >
                                Browse Jobs Now
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {applications.map((app) => (
                            <Card
                                key={app._id}
                                hoverable
                                className="application-card"
                                style={{
                                    borderRadius: 16,
                                    overflow: "hidden",
                                    border: "none",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                }}
                                bodyStyle={{ padding: 32 }}
                            >
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} md={18}>
                                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                                            <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#1f1f1f" }}>
                                                <Link to={`/jobs/${app.jobId?.slug || app.jobId?._id}`} style={{ color: "inherit" }}>
                                                    {app.jobId?.title || "Unknown Job"}
                                                </Link>
                                            </Title>
                                            <Tag
                                                color={app.status === "REJECTED" ? "red" : app.status === "OFFER" ? "green" : "blue"}
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: 100,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    border: "none",
                                                    margin: 0
                                                }}
                                            >
                                                {app.status?.replace("_", " ")}
                                            </Tag>
                                        </div>

                                        <Row gutter={[24, 12]} style={{ marginBottom: 24 }}>
                                            <Col>
                                                <Text style={{ fontSize: 16, color: "#595959" }}>
                                                    <BankOutlined style={{ marginRight: 8, color: "#ED1B2F" }} />
                                                    <span style={{ fontWeight: 500 }}>{app.jobId?.company || "N/A"}</span>
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Text style={{ fontSize: 16, color: "#595959" }}>
                                                    <EnvironmentOutlined style={{ marginRight: 8, color: "#ED1B2F" }} />
                                                    {app.jobId?.location || "N/A"}
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Text style={{ fontSize: 16, color: "#8c8c8c" }}>
                                                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                                                    Applied {new Date(app.createdAt).toLocaleDateString()}
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col xs={24} md={6} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                        <Button
                                            size="large"
                                            onClick={() => navigate(`/jobs/${app.jobId?.slug || app.jobId?._id}`)}
                                            style={{ borderRadius: 8 }}
                                        >
                                            View Details
                                        </Button>
                                    </Col>
                                </Row>

                                <div style={{ background: "#fafafa", borderRadius: 12, padding: "24px 32px", marginTop: 8 }}>
                                    <Steps
                                        current={getStatusStep(app.status)}
                                        status={getStatusStatus(app.status)}
                                        size="small"
                                        labelPlacement="vertical"
                                    >
                                        <Step title="Applied" icon={<FileTextOutlined />} />
                                        <Step title="Screening" icon={<EyeOutlined />} />
                                        <Step title="Assessment" icon={<ClockCircleOutlined />} />
                                        <Step title="Interview" icon={<CheckCircleOutlined />} />
                                        <Step title="Offer" icon={<CheckCircleOutlined />} />
                                    </Steps>

                                    {/* Evaluation Links & Info */}
                                    <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                        {/* Technical Test Section */}
                                        {app.jobId?.challengeId && (
                                            <Card size="small" style={{ flex: 1, minWidth: 280, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Space>
                                                        <ClockCircleOutlined style={{ color: '#10B981' }} />
                                                        <Text strong>Technical Assessment</Text>
                                                    </Space>
                                                    {app.status === 'APPLIED' || app.status === 'SCREENED' ? (
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            danger
                                                            style={{ background: '#ED1B2F', borderRadius: 4 }}
                                                            onClick={() => navigate(`/challenge/${app.jobId.challengeId}`)}
                                                        >
                                                            Start Test
                                                        </Button>
                                                    ) : (
                                                        <Tag color="green">Completed (Score: {app.testScore || 0})</Tag>
                                                    )}
                                                </div>
                                            </Card>
                                        )}

                                        {/* Interview Section */}
                                        {app.interview && (
                                            <Card size="small" style={{ flex: 1, minWidth: 280, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Space>
                                                        <CheckCircleOutlined style={{ color: '#3b82f6' }} />
                                                        <Text strong>Interview Schedule</Text>
                                                    </Space>
                                                    {app.interview.status === 'SCHEDULED' ? (
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            onClick={() => window.open(app.interview.meetingLink, '_blank')}
                                                            disabled={!app.interview.meetingLink}
                                                            style={{ borderRadius: 4 }}
                                                        >
                                                            Join Meeting
                                                        </Button>
                                                    ) : (
                                                        <Tag color="blue">{app.interview.status}</Tag>
                                                    )}
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                                                    {new Date(app.interview.scheduledAt).toLocaleString()}
                                                </div>
                                            </Card>
                                        )}
                                    </div>

                                    {app.status === "REJECTED" && (
                                        <div style={{ marginTop: 24, padding: "12px 16px", background: "#fff1f0", border: "1px solid #ffa39e", borderRadius: 8, color: "#cf1322" }}>
                                            <CloseCircleOutlined style={{ marginRight: 8 }} />
                                            <strong>Application Ended:</strong> Unfortunately, we are not moving forward with your application at this time.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .application-card:hover {
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important;
                    transform: translateY(-2px);
                    transition: all 0.3s ease;
                }
                .ant-steps-item-process .ant-steps-item-icon {
                    background-color: #ED1B2F;
                    border-color: #ED1B2F;
                }
                .ant-steps-item-finish .ant-steps-item-icon {
                    border-color: #ED1B2F;
                }
                .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
                    color: #ED1B2F;
                }
                .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-tail::after {
                    background-color: #ED1B2F;
                }
            `}</style>
        </div>
    );
};

export default MyApplicationsPage;
