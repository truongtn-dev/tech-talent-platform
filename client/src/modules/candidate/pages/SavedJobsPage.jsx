import { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import bookmarkService from "../../../services/bookmarkService";
import JobCard from "../../../modules/jobs/components/JobCard";
import "../../../styles/jobs.css";

const { Title, Paragraph } = Typography;

const SavedJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const data = await bookmarkService.getMyBookmarks();

            // Safety check: ensure data is an array
            if (Array.isArray(data)) {
                // Filter out null jobs (if job was deleted but bookmark remains)
                const validJobs = data.map(b => b.jobId).filter(j => j != null);
                setJobs(validJobs);
            } else {
                setJobs([]);
            }
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBookmark = (jobId, isAdded) => {
        // If removed from Saved Jobs page, we should remove it from the list
        if (!isAdded) {
            setJobs(prev => prev.filter(job => job._id !== jobId));
        }
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
                    <Title level={1} style={{ color: "white", margin: "0 0 8px 0", fontWeight: 700 }}>Saved Jobs</Title>
                    <Paragraph style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: 0 }}>
                        Manage your bookmarked opportunities
                    </Paragraph>
                </div>
            </div>

            <div className="container" style={{ maxWidth: 1000, margin: "-60px auto 40px", padding: "0 24px", position: "relative" }}>
                {loading ? (
                    <Card style={{ borderRadius: 12, padding: 80, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                        <Spin size="large" />
                    </Card>
                ) : jobs.length === 0 ? (
                    <Card style={{ borderRadius: 12, padding: 60, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                        <Empty
                            description={
                                <span style={{ fontSize: 16, color: "#595959" }}>
                                    No saved jobs yet.
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
                    <Row gutter={[24, 24]}>
                        {jobs.map((job) => (
                            <Col xs={24} lg={12} key={job._id}>
                                <JobCard
                                    job={job}
                                    isBookmarked={true}
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

export default SavedJobsPage;
