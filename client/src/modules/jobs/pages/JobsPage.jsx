import { useState, useEffect } from "react";
import { Card, Row, Col, Tag, Input, Select, Button, Spin, Empty, Typography } from "antd";
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, ProjectOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import jobService from "../api";
import "../../../styles/jobs.css";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await jobService.getAllJobs();
            setJobs(data.jobs || data || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = !locationFilter || job.location === locationFilter;
        const matchesType = !typeFilter || job.type === typeFilter;
        return matchesSearch && matchesLocation && matchesType;
    });

    const uniqueLocations = [...new Set(jobs.map(job => job.location).filter(Boolean))];
    const jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
            {/* Hero Section */}
            <div style={{
                background: "linear-gradient(135deg, #1f1f1f 0%, #ED1B2F 100%)",
                padding: "80px 0 60px",
                color: "white"
            }}>
                <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
                    <Title level={1} style={{ color: "white", marginBottom: 16, fontSize: 48 }}>
                        Find Your Dream Job
                    </Title>
                    <Paragraph style={{ color: "#e0e0e0", fontSize: 18, marginBottom: 40 }}>
                        Explore thousands of opportunities from top companies
                    </Paragraph>

                    <Search
                        placeholder="Search by job title, company, or keyword..."
                        size="large"
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: 600 }}
                        className="jobs-search"
                    />
                </div>
            </div>

            {/* Filters & Content */}
            <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
                {/* Filters */}
                <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={8} style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Location</Text>
                            <Select
                                placeholder="All Locations"
                                style={{ width: "100%" }}
                                size="large"
                                allowClear
                                onChange={setLocationFilter}
                            >
                                {uniqueLocations.map(loc => (
                                    <Select.Option key={loc} value={loc}>{loc}</Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8} style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>Job Type</Text>
                            <Select
                                placeholder="All Types"
                                style={{ width: "100%" }}
                                size="large"
                                allowClear
                                onChange={setTypeFilter}
                            >
                                {jobTypes.map(type => (
                                    <Select.Option key={type} value={type}>
                                        {type.replace("_", " ")}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} md={8} style={{ marginBottom: 16 }}>
                            <Text strong style={{ display: "block", marginBottom: 8 }}>&nbsp;</Text>
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={() => {
                                    setSearchTerm("");
                                    setLocationFilter("");
                                    setTypeFilter("");
                                }}
                                style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
                            >
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Results Count */}
                <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ fontSize: 18 }}>
                        {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"} Found
                    </Text>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <Empty
                        description="No jobs found"
                        style={{ padding: 60 }}
                    />
                ) : (
                    <Row gutter={[24, 24]}>
                        {filteredJobs.map((job) => (
                            <Col xs={24} lg={12} key={job._id}>
                                <Card
                                    hoverable
                                    className="job-card"
                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                    style={{
                                        borderRadius: 12,
                                        height: "100%",
                                        border: "1px solid #f0f0f0",
                                        transition: "all 0.3s ease"
                                    }}
                                    bodyStyle={{ padding: 24 }}
                                >
                                    {job.thumbnail && (
                                        <div style={{ marginBottom: 16 }}>
                                            <img
                                                src={job.thumbnail}
                                                alt={job.title}
                                                style={{
                                                    width: "100%",
                                                    height: 180,
                                                    objectFit: "cover",
                                                    borderRadius: 8
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 16 }}>
                                        <Title level={4} style={{ marginBottom: 8, color: "#1f1f1f" }}>
                                            {job.title}
                                        </Title>
                                        <Text strong style={{ fontSize: 16, color: "#ED1B2F" }}>
                                            {job.company}
                                        </Text>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <EnvironmentOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                                            <Text>{job.location || "Remote"}</Text>
                                        </div>
                                        {job.salary && (
                                            <div style={{ marginBottom: 8 }}>
                                                <DollarOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                                                <Text>{job.salary}</Text>
                                            </div>
                                        )}
                                        <div style={{ marginBottom: 8 }}>
                                            <ProjectOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                                            <Text>{job.type?.replace("_", " ") || "Full Time"}</Text>
                                        </div>
                                        <div>
                                            <ClockCircleOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                                            <Text type="secondary">
                                                Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                                            </Text>
                                        </div>
                                    </div>

                                    <Paragraph
                                        ellipsis={{ rows: 3 }}
                                        style={{ color: "#595959", marginBottom: 16 }}
                                    >
                                        {job.description}
                                    </Paragraph>

                                    {job.skills && job.skills.length > 0 && (
                                        <div>
                                            {job.skills.slice(0, 4).map((skill, idx) => (
                                                <Tag key={idx} color="blue" style={{ marginBottom: 4 }}>
                                                    {skill}
                                                </Tag>
                                            ))}
                                            {job.skills.length > 4 && (
                                                <Tag>+{job.skills.length - 4} more</Tag>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default JobsPage;
