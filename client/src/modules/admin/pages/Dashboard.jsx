import { useState, useEffect } from "react";
import {
    Row, Col, Statistic, Table, Tag, Avatar, Space, Typography, Spin, message, Tabs, Card, List
} from "antd";
import {
    DashboardOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined,
    BellOutlined,
    UserOutlined,
    ArrowUpOutlined,
    AppstoreOutlined,
    HistoryOutlined,
    FileTextOutlined,
    SolutionOutlined,
    RiseOutlined,
    WalletOutlined,
    StarFilled
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

const { Title, Text } = Typography;

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        console.log("Dashboard: Starting data fetch...");

        // Use individual try-catch or Promise.allSettled for resilience
        const loadResource = async (fn, name, setter) => {
            try {
                const res = await fn();
                console.log(`Dashboard: Loaded ${name}`, res);
                setter(res.users || res);
                return res;
            } catch (err) {
                console.error(`Dashboard: Error loading ${name}`, err);
                return null;
            }
        };

        try {
            const [statsRes] = await Promise.all([
                adminService.getStats(),
                loadResource(adminService.getAllUsers, "users", setUsers),
                loadResource(adminService.getAllJobs, "jobs", setJobs),
                loadResource(adminService.getBlogs, "blogs", setBlogs),
                loadResource(adminService.getApplications, "applications", setApplications)
            ]);

            if (statsRes) {
                console.log("Dashboard: Loaded stats", statsRes);
                setStats(statsRes);
            }
        } catch (error) {
            console.error("Dashboard: Global fetch error:", error);
            message.error("Failed to load dashboard statistics");
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic "Categories" using Level or Type since 'category' prop is missing in Model
    const topCategories = Object.entries(
        jobs.reduce((acc, job) => {
            const key = job.type?.replace('_', ' ') || 'Other';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {})
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Columns definitions
    const userColumns = [
        {
            title: 'User Identity',
            key: 'user',
            render: (_, record) => (
                <Space size="middle">
                    <Avatar src={record.avatar || null} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {record.email}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {record.firstName || record.lastName ? `${record.firstName || ''} ${record.lastName || ''}`.trim() : record.email.split('@')[0]}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'default';
                if (role === 'ADMIN') color = 'red';
                if (role === 'RECRUITER') color = 'blue';
                if (role === 'CANDIDATE') color = 'green';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Professional',
            key: 'pro',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{record.headline || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.location || 'N/A'}</div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === "ACTIVE" ? "success" : "error"}>
                    {status || "ACTIVE"}
                </Tag>
            )
        }
    ];

    const jobColumns = [
        {
            title: 'Job / Company',
            key: 'title',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.title}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.company || record.recruiterId?.email}</div>
                </div>
            )
        },
        { title: 'Type', dataIndex: 'type', key: 'type', render: (t) => <Tag color="blue">{t?.replace('_', ' ')}</Tag> },
        { title: 'Level', dataIndex: 'level', key: 'level' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'PUBLISHED' ? 'green' : (status === 'PENDING' ? 'orange' : 'gray')}>{status}</Tag>
        }
    ];

    const blogColumns = [
        { title: 'Title', dataIndex: 'title', key: 'title', width: '40%' },
        { title: 'Author', dataIndex: 'author', key: 'author', render: (a) => a?.email || 'Admin' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'PUBLISHED' ? 'green' : 'default'}>{status}</Tag>
        },
        { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d) => new Date(d).toLocaleDateString() }
    ];

    const appColumns = [
        {
            title: 'Target Job',
            dataIndex: 'jobId',
            key: 'job',
            render: (j) => j?.title || 'Unknown Job'
        },
        {
            title: 'Candidate',
            dataIndex: 'candidateId',
            key: 'candidate',
            render: (c) => <div style={{ fontWeight: 500 }}>{c?.email}</div>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                const colors = { 'APPLIED': 'blue', 'SCREENED': 'cyan', 'INTERVIEW': 'purple', 'OFFER': 'green', 'REJECTED': 'red' };
                return <Tag color={colors[s] || 'default'}>{s}</Tag>;
            }
        },
        { title: 'Date', dataIndex: 'createdAt', key: 'date', render: (d) => new Date(d).toLocaleDateString() }
    ];

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <AdminLayout>
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
                    <DashboardOutlined style={{ marginRight: 10, fontSize: '20px', color: '#ED1B2F' }} />
                    Admin Overview
                </Title>
            </div>

            {/* Row 1: Gradient Stat Cards */}
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <div className="gradient-card purple">
                        <div className="stat-icon-bg"><TeamOutlined /></div>
                        <div className="stat-label">Total Platform Users</div>
                        <div className="stat-value">{stats?.totalUsers || 0}</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>Growing user base (Candidates & Recruiters)</div>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <div className="gradient-card pink">
                        <div className="stat-icon-bg"><SolutionOutlined /></div>
                        <div className="stat-label">Active Job Postings</div>
                        <div className="stat-value">{stats?.totalJobs || 0}</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>Available opportunities for candidates</div>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <div className="gradient-card blue">
                        <div className="stat-icon-bg"><RiseOutlined /></div>
                        <div className="stat-label">Total Applications</div>
                        <div className="stat-value">{stats?.totalApplications || 0}</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>Processed matches across categories</div>
                    </div>
                </Col>
            </Row>

            {/* Row 2: Categorized Stats & Middle Section */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={8}>
                    <Card title={<span><StarFilled style={{ color: '#fadb14', marginRight: 8 }} /> Top Categories</span>} bordered={false} style={{ borderRadius: 16, height: '100%' }}>
                        <List
                            dataSource={topCategories}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <Space>
                                        <Avatar size="small" style={{ backgroundColor: '#f0f0f0', color: '#666' }}>{index + 1}</Avatar>
                                        <Text strong>{item.name}</Text>
                                    </Space>
                                    <Tag style={{ borderRadius: 10 }}>{item.count} Jobs</Tag>
                                </List.Item>
                            )}
                            locale={{ emptyText: 'No categories yet' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Row gutter={[24, 24]}>
                        <Col span={12}>
                            <div className="circle-stat-card">
                                <div>
                                    <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Total Candidates</div>
                                    <div style={{ fontSize: 32, fontWeight: 700 }}>{stats?.totalCandidates || 0}</div>
                                    <div style={{ fontSize: 12, color: '#ff4d4f' }}>Active job seekers</div>
                                </div>
                                <div className="circle-stat-icon red"><UserOutlined /></div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="circle-stat-card">
                                <div>
                                    <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Total Recruiters</div>
                                    <div style={{ fontSize: 32, fontWeight: 700 }}>{stats?.totalRecruiters || 0}</div>
                                    <div style={{ fontSize: 12, color: '#52c41a' }}>Verified companies</div>
                                </div>
                                <div className="circle-stat-icon green"><TeamOutlined /></div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Row 3: Data Management Tabs */}
            <div style={{ marginTop: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <AppstoreOutlined style={{ fontSize: 20, color: '#ED1B2F', marginRight: 12 }} />
                    <Title level={4} style={{ margin: 0 }}>Data Management</Title>
                </div>

                <div style={{ background: '#fff', borderRadius: 16, padding: '16px 24px', border: '1px solid #f0f0f0' }}>
                    <Tabs defaultActiveKey="1" className="admin-tabs">
                        <Tabs.TabPane tab={<span><UserOutlined /> Users ({users.length})</span>} key="1">
                            <Table size="small" columns={userColumns} dataSource={users} rowKey="_id" pagination={{ pageSize: 5 }} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><ThunderboltOutlined /> Jobs ({jobs.length})</span>} key="2">
                            <Table size="small" columns={jobColumns} dataSource={jobs} rowKey="_id" pagination={{ pageSize: 5 }} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><FileTextOutlined /> Blogs ({blogs.length})</span>} key="3">
                            <Table size="small" columns={blogColumns} dataSource={blogs} rowKey="_id" pagination={{ pageSize: 5 }} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={<span><SolutionOutlined /> Applications ({applications.length})</span>} key="4">
                            <Table size="small" columns={appColumns} dataSource={applications} rowKey="_id" pagination={{ pageSize: 5 }} />
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
