import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Button, Table, Tag, Space, Avatar, message, Skeleton } from "antd";
import {
    AppstoreOutlined,
    TeamOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    PlusOutlined,
    RiseOutlined
} from "@ant-design/icons";
import recruiterService from "../api";
import RecruiterLayout from "../components/RecruiterLayout";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeJobs: 0, totalApplications: 0, interviews: 0 });
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, appsRes] = await Promise.all([
                recruiterService.getDashboardStats(),
                recruiterService.getApplications()
            ]);
            setStats(statsRes);
            // Show only top 5 recent apps
            setRecentApplications(appsRes.slice(0, 5));
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            message.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const dashboardStats = [
        { title: 'Active Jobs', value: stats.activeJobs, icon: <AppstoreOutlined />, color: '#4F46E5', trend: 'Live postings', bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' },
        { title: 'Applications', value: stats.totalApplications, icon: <TeamOutlined />, color: '#10B981', trend: 'Total received', bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' },
        { title: 'Interviews', value: stats.interviews, icon: <CalendarOutlined />, color: '#F59E0B', trend: 'To be conducted', bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' },
    ];

    const columns = [
        {
            title: 'Candidate',
            key: 'candidate',
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.candidateId?.avatar}
                        style={{ background: '#4F46E5' }}
                    >
                        {record.candidateId?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block' }}>{record.candidateId?.email}</Text>
                    </div>
                </Space>
            )
        },
        { title: 'Applied Job', dataIndex: ['jobId', 'title'], key: 'job' },
        {
            title: 'AI Score',
            dataIndex: 'matchingScore',
            key: 'score',
            render: (score) => <Tag color={score > 80 ? 'success' : 'warning'} style={{ fontWeight: 700, borderRadius: 6 }}>{score}% Match</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { APPLIED: 'blue', SCREENED: 'cyan', INTERVIEW: 'purple', OFFER: 'green', REJECTED: 'red' };
                return <Tag color={colors[status] || 'default'} style={{ borderRadius: 6 }}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (record) => (
                <Button
                    type="text"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate('/recruiter/applications')}
                />
            )
        }
    ];

    return (
        <RecruiterLayout>
            {/* Header Card */}
            <div style={{
                marginBottom: 24,
                padding: '16px 24px',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                    <AppstoreOutlined style={{ marginRight: 10, fontSize: '20px', color: '#4F46E5' }} />
                    Recruiter Overview
                </Title>
            </div>

            <Row gutter={[24, 24]}>
                {dashboardStats.map((stat, index) => (
                    <Col xs={24} md={8} key={index}>
                        <Card variant="borderless" style={{ borderRadius: 20, background: stat.bg, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <Text style={{ color: '#4b5563', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>{stat.title}</Text>
                                        <Title level={2} style={{ margin: '8px 0 4px', fontWeight: 800 }}>{stat.value}</Title>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <RiseOutlined style={{ color: '#10B981' }} />
                                            <Text style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>{stat.trend}</Text>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#fff',
                                        width: 50,
                                        height: 50,
                                        borderRadius: 15,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stat.color,
                                        fontSize: 22,
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
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
                    <Card
                        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Priority Candidates</span>}
                        variant="borderless"
                        style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                        extra={<Button type="link" onClick={() => navigate('/recruiter/applications')} style={{ color: '#4F46E5', fontWeight: 600 }}>View All</Button>}
                    >
                        <Table
                            loading={loading}
                            dataSource={recentApplications}
                            columns={columns}
                            pagination={false}
                            rowKey="_id"
                        />
                    </Card>
                </Col>
                <Col lg={8}>
                    <Card
                        title={<span style={{ fontSize: 18, fontWeight: 700 }}>Quick Actions</span>}
                        variant="borderless"
                        style={{ borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <Button
                                type="primary"
                                block
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/recruiter/jobs')}
                                style={{ background: '#4F46E5', borderRadius: 12, height: 50, fontWeight: 600 }}
                            >
                                Post a Job
                            </Button>
                            <Button block size="large" icon={<CalendarOutlined />} style={{ borderRadius: 12, height: 50, fontWeight: 600 }}>
                                Schedule Interview
                            </Button>
                            <Button
                                block
                                size="large"
                                icon={<TeamOutlined />}
                                onClick={() => navigate('/recruiter/applications')}
                                style={{ borderRadius: 12, height: 50, fontWeight: 600 }}
                            >
                                Browse Talent
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </RecruiterLayout>
    );
};

export default RecruiterDashboard;
