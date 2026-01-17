import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Button, Table, Tag, Space, Avatar, message, Skeleton } from "antd";
import {
    BookOutlined,
    VideoCameraOutlined,
    CheckCircleOutlined,
    LineChartOutlined,
    PlusOutlined,
    ArrowRightOutlined
} from "@ant-design/icons";
import InterviewerLayout from "../components/InterviewerLayout";
import { useNavigate } from "react-router-dom";
import interviewerService from "../api";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const InterviewerDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalQuestions: 0, upcomingInterviews: 0, completedEvaluations: 0 });
    const [recentInterviews, setRecentInterviews] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, interviewsRes] = await Promise.all([
                interviewerService.getStats(),
                interviewerService.getInterviews()
            ]);
            setStats(statsRes);
            setRecentInterviews(interviewsRes.slice(0, 5));
        } catch (error) {
            message.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = [
        { title: 'Question Bank', value: stats.totalQuestions, icon: <BookOutlined />, color: '#10B981', trend: 'Questions', bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' },
        { title: 'Scheduled', value: stats.upcomingInterviews, icon: <VideoCameraOutlined />, color: '#8B5CF6', trend: 'Interviews', bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' },
        { title: 'Evaluations', value: stats.completedEvaluations, icon: <CheckCircleOutlined />, color: '#F59E0B', trend: 'Completed', bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' },
    ];

    const interviewColumns = [
        {
            title: 'Candidate',
            key: 'candidate',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.candidateId?.avatar} style={{ background: '#10B981' }}>
                        {record.candidateId?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <Text strong>{record.candidateId?.email}</Text>
                </Space>
            )
        },
        { title: 'Job Role', dataIndex: ['applicationId', 'jobId', 'title'], key: 'job' },
        {
            title: 'Schedule',
            key: 'time',
            render: (_, record) => <Tag color="blue">{dayjs(record.scheduledAt).format("MMM DD, HH:mm")}</Tag>
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        if (record.meetingLink) {
                            window.open(record.meetingLink, '_blank');
                        } else {
                            message.warning("Meeting link not available");
                        }
                    }}
                    style={{ background: '#10B981', borderColor: '#10B981', borderRadius: 6 }}
                >
                    Join Room
                </Button>
            )
        }
    ];

    return (
        <InterviewerLayout>
            {/* Header Card */}
            <div style={{
                marginBottom: 16,
                padding: '16px 24px',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                    <LineChartOutlined style={{ marginRight: 10, fontSize: '20px', color: '#10B981' }} />
                    Interviewer Dashboard
                </Title>
                <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                    Welcome back! Here's what's happening today.
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {dashboardStats.map((stat, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 16,
                                background: stat.bg,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.01)'
                            }}
                        >
                            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.title}</Text>
                                        <Title level={2} style={{ margin: '4px 0', fontWeight: 800, color: '#1e293b' }}>{stat.value}</Title>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, color: stat.color }}>
                                                {stat.trend}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#fff',
                                        width: 54,
                                        height: 54,
                                        borderRadius: 14,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color,
                                        fontSize: 24,
                                        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)'
                                    }}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </Skeleton>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col lg={16}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={5} style={{ margin: 0, fontWeight: 700 }}>Upcoming Interviews</Title>
                            <Button type="link" onClick={() => navigate('/interviewer/sessions')} style={{ color: '#10B981', fontWeight: 600, padding: 0 }}>
                                View All <ArrowRightOutlined />
                            </Button>
                        </div>
                        <div style={{ padding: '1px' }}>
                            <Table
                                dataSource={recentInterviews}
                                columns={interviewColumns}
                                pagination={false}
                                loading={loading}
                                rowKey="_id"
                                bordered={false}
                                className="admin-table"
                            />
                        </div>
                    </div>
                </Col>
                <Col lg={8}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        padding: '24px'
                    }}>
                        <Title level={5} style={{ marginBottom: 20, fontWeight: 700 }}>Quick Actions</Title>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/interviewer/questions')}
                                style={{ background: '#10B981', borderColor: '#10B981', borderRadius: 10, height: 48, fontWeight: 600 }}
                            >
                                New Question
                            </Button>
                            <Button block size="large" icon={<VideoCameraOutlined />} style={{ borderRadius: 10, height: 48, fontWeight: 600 }}>
                                Join Interview
                            </Button>
                            <Button block size="large" icon={<BookOutlined />} style={{ borderRadius: 10, height: 48, fontWeight: 600 }}>
                                Browse Assets
                            </Button>
                        </Space>
                    </div>
                </Col>
            </Row>
        </InterviewerLayout>
    );
};

export default InterviewerDashboard;
