import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Spin, message, Input, Tag, Avatar } from "antd";
import { SearchOutlined, UserOutlined, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import blogService from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import AppHeader from "../../../components/layout/Header";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await blogService.getPublicBlogs();
                setBlogs(data);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
                {/* Hero Section */}
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <Title level={1} style={{ fontSize: 48, fontWeight: 800, marginBottom: 16 }}>
                        Tech Talent <span style={{ color: "#4F46E5" }}>Insights</span>
                    </Title>
                    <Paragraph style={{ fontSize: 18, color: "#64748b", maxWidth: 600, margin: "0 auto 32px" }}>
                        Discover the latest trends in tech recruitment, career advice, and industry insights.
                    </Paragraph>
                    <Input
                        size="large"
                        placeholder="Search for articles..."
                        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            maxWidth: 500,
                            borderRadius: 12,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            border: "none",
                            height: 56,
                            fontSize: 16
                        }}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[32, 32]}>
                        {filteredBlogs.map((blog) => (
                            <Col xs={24} md={12} lg={8} key={blog._id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div style={{ height: 240, overflow: "hidden", position: "relative" }}>
                                            <img
                                                alt={blog.title}
                                                src={blog.thumbnail || "https://placehold.co/600x400?text=Blog"}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    transition: "transform 0.3s ease"
                                                }}
                                            />
                                            {/* Tag Overlay */}
                                            <div style={{ position: "absolute", top: 16, left: 16 }}>
                                                <Tag color="blue" style={{ border: "none", borderRadius: 4, fontWeight: 600 }}>ARTICLE</Tag>
                                            </div>
                                        </div>
                                    }
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        border: "none",
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                    bodyStyle={{ flex: 1, display: "flex", flexDirection: "column", padding: 24 }}
                                    onClick={() => navigate(`/blog/${blog.slug}`)}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 13, color: "#94a3b8" }}>
                                            <ClockCircleOutlined />
                                            <span>{dayjs(blog.createdAt).format("MMM D, YYYY")}</span>
                                        </div>
                                        <Title level={4} style={{
                                            marginBottom: 12,
                                            fontSize: 20,
                                            lineHeight: 1.4,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}>
                                            {blog.title}
                                        </Title>
                                        {/* Optional: Add excerpt/summary if available locally or strip HTML */}
                                    </div>

                                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Avatar src={blog.author?.avatar} icon={<UserOutlined />} />
                                            <Text strong style={{ fontSize: 13, color: "#475569" }}>{blog.author?.email?.split('@')[0] || "Author"}</Text>
                                        </div>
                                        <ArrowRightOutlined style={{ color: "#4F46E5" }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default BlogList;
