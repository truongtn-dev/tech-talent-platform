import { useState, useEffect } from "react";
import { Card, Row, Col, Tag, Input, Select, Button, Spin, Empty, Typography } from "antd";
import { SearchOutlined, EnvironmentOutlined, DollarOutlined, ClockCircleOutlined, ProjectOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import jobService from "../api";
import bookmarkService from "../../../services/bookmarkService";
import JobCard from "../components/JobCard";
import "../../../styles/jobs.css";
import { useAuth } from "../../../context/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [bookmarkedJobIds, setBookmarkedJobIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const [jobsData, bookmarksData] = await Promise.all([
                jobService.getAllJobs(),
                user && user.role === 'CANDIDATE' ? bookmarkService.getMyBookmarks() : Promise.resolve([])
            ]);

            setJobs(jobsData.jobs || jobsData || []);

            if (Array.isArray(bookmarksData)) {
                // bookmarksData contains objects with jobId populated. We need the IDs.
                // Wait, getMyBookmarks returns objects { userId, jobId: { ... } } or just { ... }
                // Let's check the service. It populates jobId. So the items are Bookmark docs.
                // We need to map to bookmark.jobId._id
                const ids = bookmarksData.map(b => b.jobId._id);
                setBookmarkedJobIds(ids);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBookmark = (jobId, isAdded) => {
        if (isAdded) {
            setBookmarkedJobIds(prev => [...prev, jobId]);
        } else {
            setBookmarkedJobIds(prev => prev.filter(id => id !== jobId));
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
                    <Title level={1} style={{ color: "white", marginBottom: 16, fontSize: "3.5rem", fontWeight: 800 }}>
                        Find Your Dream Job
                    </Title>
                    <Paragraph style={{ color: "#e0e0e0", fontSize: 18, marginBottom: 40 }}>
                        Explore thousands of opportunities from top companies
                    </Paragraph>

                    <Search
                        placeholder="Search by job title, company, or keyword..."
                        enterButton="Search"
                        size="large"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onSearch={(value) => setSearchTerm(value)}
                        style={{ maxWidth: 600, width: '100%' }}
                        className="jobs-search-custom"
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
                                <JobCard
                                    job={job}
                                    isBookmarked={bookmarkedJobIds.includes(job._id)}
                                    onToggleBookmark={handleToggleBookmark}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default JobsPage;
