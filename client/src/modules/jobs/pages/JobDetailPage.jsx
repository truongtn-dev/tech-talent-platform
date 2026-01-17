import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, Divider, Typography, Spin, message, Row, Col } from "antd";
import {
    EnvironmentOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import jobService from "../api";
import { useAuth } from "../../../context/AuthContext";

const { Title, Text, Paragraph } = Typography;

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchJobDetail();
    }, [id]);

    const fetchJobDetail = async () => {
        setLoading(true);
        try {
            const data = await jobService.getJobById(id);
            setJob(data.job || data);
        } catch (error) {
            console.error("Error fetching job details:", error);
            message.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            message.warning("Please login to apply for this job");
            navigate("/login");
            return;
        }

        setApplying(true);
        try {
            // TODO: Implement apply logic
            message.success("Application submitted successfully!");
        } catch (error) {
            message.error("Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 0", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{ textAlign: "center", padding: "100px 0", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
                <Title level={3}>Job not found</Title>
                <Button type="primary" onClick={() => navigate("/jobs")} style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}>
                    Back to Jobs
                </Button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", paddingBottom: 60 }}>
            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #1f1f1f 0%, #ED1B2F 100%)",
                padding: "40px 0",
                color: "white"
            }}>
                <div className="container" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/jobs")}
                        style={{ color: "white", marginBottom: 24, padding: 0 }}
                    >
                        Back to Jobs
                    </Button>
                    <Title level={2} style={{ color: "white", marginBottom: 8 }}>
                        {job.title}
                    </Title>
                    <Title level={4} style={{ color: "#e0e0e0", fontWeight: 400 }}>
                        {job.company}
                    </Title>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ maxWidth: 1000, margin: "-40px auto 0", padding: "0 24px" }}>
                <Row gutter={24}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
                            {/* Job Overview */}
                            <div style={{ marginBottom: 24 }}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={12} sm={6}>
                                        <div style={{ textAlign: "center" }}>
                                            <EnvironmentOutlined style={{ fontSize: 24, color: "#ED1B2F", marginBottom: 8 }} />
                                            <div>
                                                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Location</Text>
                                                <Text strong>{job.location || "Remote"}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div style={{ textAlign: "center" }}>
                                            <ProjectOutlined style={{ fontSize: 24, color: "#ED1B2F", marginBottom: 8 }} />
                                            <div>
                                                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Job Type</Text>
                                                <Text strong>{job.type?.replace("_", " ") || "Full Time"}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div style={{ textAlign: "center" }}>
                                            <DollarOutlined style={{ fontSize: 24, color: "#ED1B2F", marginBottom: 8 }} />
                                            <div>
                                                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Salary</Text>
                                                <Text strong>{job.salary || "Negotiable"}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                        <div style={{ textAlign: "center" }}>
                                            <CalendarOutlined style={{ fontSize: 24, color: "#ED1B2F", marginBottom: 8 }} />
                                            <div>
                                                <Text type="secondary" style={{ display: "block", fontSize: 12 }}>Posted</Text>
                                                <Text strong>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <Divider />

                            {/* Description */}
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4}>Job Description</Title>
                                <Paragraph style={{ fontSize: 16, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                                    {job.description}
                                </Paragraph>
                            </div>

                            {/* Requirements */}
                            {job.requirements && job.requirements.length > 0 && (
                                <div style={{ marginBottom: 24 }}>
                                    <Title level={4}>Requirements</Title>
                                    <ul style={{ fontSize: 16, lineHeight: 2 }}>
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx}>
                                                <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Skills */}
                            {job.skills && job.skills.length > 0 && (
                                <div>
                                    <Title level={4}>Required Skills</Title>
                                    <div>
                                        {job.skills.map((skill, idx) => (
                                            <Tag key={idx} color="blue" style={{ marginBottom: 8, padding: "4px 12px", fontSize: 14 }}>
                                                {skill}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Card style={{ borderRadius: 12, position: "sticky", top: 24 }}>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleApply}
                                loading={applying}
                                style={{
                                    backgroundColor: "#ED1B2F",
                                    borderColor: "#ED1B2F",
                                    height: 48,
                                    fontSize: 16,
                                    marginBottom: 16
                                }}
                            >
                                Apply Now
                            </Button>

                            <Divider />

                            <div style={{ marginBottom: 16 }}>
                                <Text strong style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                                    <TeamOutlined style={{ marginRight: 8 }} />
                                    Company
                                </Text>
                                <Text style={{ fontSize: 16 }}>{job.company}</Text>
                            </div>

                            {job.contactEmail && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text strong style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                                        Contact Email
                                    </Text>
                                    <Text style={{ fontSize: 16 }}>{job.contactEmail}</Text>
                                </div>
                            )}

                            <div style={{ marginBottom: 16 }}>
                                <Text strong style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                                    Job Status
                                </Text>
                                <Tag color="green" style={{ fontSize: 14 }}>
                                    {job.status || "Active"}
                                </Tag>
                            </div>

                            {job.applicationDeadline && (
                                <div>
                                    <Text strong style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                                        Application Deadline
                                    </Text>
                                    <Text style={{ fontSize: 16 }}>
                                        {new Date(job.applicationDeadline).toLocaleDateString()}
                                    </Text>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default JobDetailPage;
