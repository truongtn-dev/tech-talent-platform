import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Spin, Avatar, Tag, Divider, Button, Breadcrumb, Row, Col, Card } from "antd";
import { UserOutlined, ClockCircleOutlined, ArrowLeftOutlined, HomeOutlined, FireOutlined } from "@ant-design/icons";
import blogService from "../api";
import dayjs from "dayjs";
import DOMPurify from "dompurify";

const { Title, Paragraph, Text } = Typography;

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [blogRes, allBlogsRes] = await Promise.all([
                    blogService.getBlogBySlug(slug),
                    blogService.getPublicBlogs()
                ]);

                setBlog(blogRes);

                // Filter out current blog and take top 5
                const others = allBlogsRes
                    .filter(b => b._id !== blogRes._id)
                    .slice(0, 5);
                setLatestBlogs(others);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div style={{ textAlign: "center", padding: 100 }}>
                <Title level={3}>Article not found</Title>
                <Button type="primary" onClick={() => navigate("/blog")}>Back to Blog</Button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#fff" }}>
            {/* Progress/Navigation Bar */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid #f0f0f0",
                padding: "16px 0"
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate("/blog")}>
                        Back to Blog
                    </Button>
                    <div style={{ display: "flex", gap: 12 }}></div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
                <Row gutter={[48, 48]}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        <article>
                            {/* Meta Header */}
                            <div style={{ marginBottom: 32 }}>
                                <Breadcrumb
                                    items={[
                                        { title: <a onClick={() => navigate('/blog')}>Blog</a> },
                                        { title: blog.title }
                                    ]}
                                    style={{ marginBottom: 24, fontSize: 14 }}
                                />

                                <Title level={1} style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 24 }}>
                                    {blog.title}
                                </Title>

                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <Avatar size={48} src={blog.author?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#f56a00' }} />
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1f2937" }}>
                                            {blog.author?.profile?.fullName || blog.author?.email?.split('@')[0] || "Author"}
                                        </div>
                                        <div style={{ fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 6 }}>
                                            <span>{dayjs(blog.createdAt).format("MMM D, YYYY")}</span>
                                            <span>•</span>
                                            <span>{Math.max(1, Math.ceil(blog.content?.length / 2000))} min read</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            {blog.thumbnail && (
                                <div style={{ marginBottom: 40, borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}>
                                    <img
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        style={{ width: "100%", height: "auto", display: "block" }}
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="blog-content"
                                style={{ fontSize: 18, lineHeight: 1.8, color: "#374151", fontFamily: "'Inter', sans-serif" }}
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
                            />

                            <Divider style={{ margin: "60px 0" }} />

                            {/* Author Bio Box - Premium Style */}
                            <div style={{
                                background: "#fff",
                                border: '1px solid #e5e7eb',
                                padding: 32,
                                borderRadius: 24,
                                display: "flex",
                                gap: 24,
                                alignItems: "center",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                            }}>
                                <Avatar
                                    size={80}
                                    src={blog.author?.avatar}
                                    icon={<UserOutlined />}
                                    style={{ border: '4px solid #f3f4f6' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {blog.author?.profile?.fullName || blog.author?.email?.split('@')[0]}
                                        </Title>
                                        <Button type="primary" shape="round" ghost style={{ borderColor: '#ED1B2F', color: '#ED1B2F' }}>
                                            Follow
                                        </Button>
                                    </div>
                                    <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 15 }}>
                                        Senior Tech Recruiter & Content Creator at Tech Talent Platform. Passionate about connecting talent with opportunity and sharing industry insights.
                                    </Paragraph>
                                </div>
                            </div>
                        </article>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <div style={{ position: "sticky", top: 100 }}>
                            <div style={{ background: "#f8fafc", padding: 24, borderRadius: 16, marginBottom: 24 }}>
                                <Title level={4} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FireOutlined style={{ color: '#ef4444' }} /> Latest Articles
                                </Title>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {latestBlogs.map((item) => (
                                        <div key={item._id}
                                            style={{ display: 'flex', gap: 16, cursor: 'pointer', group: 'hover' }}
                                            onClick={() => navigate(`/blog/${item.slug}`)}
                                        >
                                            <div style={{
                                                width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                                                backgroundImage: `url(${item.thumbnail || "https://placehold.co/150"})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }} />
                                            <div style={{ flex: 1 }}>
                                                <Title level={5} style={{
                                                    fontSize: 15, margin: 0, lineHeight: 1.4,
                                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                                }}>
                                                    {item.title}
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                                    {dayjs(item.createdAt).format("MMM D, YYYY")}
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter Box (Visual Only) */}
                            <div style={{ background: "#4F46E5", padding: 32, borderRadius: 16, color: '#fff', textAlign: 'center' }}>
                                <Title level={4} style={{ color: '#fff', marginBottom: 12 }}>Susbcribe to our newsletter</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 24 }}>
                                    Get the latest tech recruitment insights delivered to your inbox.
                                </Text>
                                <Button size="large" block style={{ color: '#4F46E5', fontWeight: 600 }}>Subscribe Now</Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Injected Styles for Content */}
            <style>{`
                .blog-content { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
                .blog-content * { font-family: inherit !important; }
                .blog-content h2 { font-size: 1.8rem; font-weight: 700; margin-top: 2em; margin-bottom: 0.8em; color: #111; }
                .blog-content h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.8em; color: #333; }
                .blog-content p { margin-bottom: 1.5em; }
                .blog-content img { max-width: 100%; border-radius: 8px; margin: 24px 0; }
                .blog-content ul, .blog-content ol { margin-bottom: 1.5em; padding-left: 1.5em; }
                .blog-content li { margin-bottom: 0.5em; }
                .blog-content blockquote { border-left: 4px solid #4F46E5; padding-left: 20px; margin: 24px 0; font-style: italic; color: #4b5563; background: #f9fafb; padding: 16px 20px; border-radius: 0 8px 8px 0; }
                .blog-content pre { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 24px 0; }
                .blog-content code { font-family: 'Fira Code', monospace !important; }
            `}</style>
        </div>
    );
};

export default BlogDetail;
