import React, { useState } from "react";
import { Card, Typography, Tag, Button, message } from "antd";
import { EnvironmentOutlined, DollarOutlined, ProjectOutlined, ClockCircleOutlined, HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import bookmarkService from "../../../services/bookmarkService";

const { Title, Text, Paragraph } = Typography;

const JobCard = ({ job, isBookmarked = false, onToggleBookmark }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleBookmarkClick = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            if (isBookmarked) {
                await bookmarkService.removeBookmark(job._id);
                message.success("Removed from saved jobs");
            } else {
                await bookmarkService.addBookmark(job._id);
                message.success("Saved job successfully");
            }
            if (onToggleBookmark) {
                onToggleBookmark(job._id, !isBookmarked);
            }
        } catch (error) {
            console.error("Bookmark error:", error);
            message.error("Failed to update bookmark");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            hoverable
            className="job-card"
            onClick={() => navigate(`/jobs/${job.slug || job._id}`)}
            style={{
                borderRadius: 12,
                height: "100%",
                border: "1px solid #f0f0f0",
                position: "relative",
                transition: "all 0.3s ease"
            }}
            bodyStyle={{ padding: 24 }}
        >
            <Button
                type="text"
                shape="circle"
                icon={isBookmarked ? <HeartFilled style={{ color: "#ED1B2F" }} /> : <HeartOutlined />}
                loading={loading}
                onClick={handleBookmarkClick}
                style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    backgroundColor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
            />

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
                <Title level={4} style={{ marginBottom: 8, color: "#1f1f1f", paddingRight: 30 }}>
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
                {job.description?.replace(/<[^>]+>/g, '')}
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
    );
};

export default JobCard;
