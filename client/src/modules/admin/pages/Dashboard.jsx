import { useState, useEffect } from "react";
import {
    Row, Col, Statistic, Table, Tag, Avatar, Space, Typography, Spin, message, Card
} from "antd";
import {
    TeamOutlined,
    ThunderboltOutlined,
    SafetyCertificateOutlined,
    BellOutlined,
    UserOutlined,
    ArrowUpOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

const { Text } = Typography;

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminService.getStats(),
                adminService.getAllUsers()
            ]);
            setStats(statsRes);
            setUsers(usersRes.users || usersRes);
        } catch (error) {
            console.error("Admin fetch error:", error);
            message.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const userColumns = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space size="middle">
                    <Avatar src={record.avatar || null} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{record.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Registered: {new Date(record.createdAt).toLocaleDateString()}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={role === 'ADMIN' ? 'red' : (role === 'RECRUITER' ? 'blue' : 'default')}>
                    {role}
                </Tag>
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

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <AdminLayout title="Dashboard">
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} xl={6}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e6f7ff', color: '#1890ff' }}>
                            <TeamOutlined />
                        </div>
                        <Statistic
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            valueStyle={{ fontWeight: 600 }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="success"><ArrowUpOutlined /> 12%</Text> <Text type="secondary" style={{ fontSize: 12 }}>vs last month</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} xl={6}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f6ffed', color: '#52c41a' }}>
                            <ThunderboltOutlined />
                        </div>
                        <Statistic
                            title="Active Jobs"
                            value={stats?.totalJobs || 0}
                            valueStyle={{ fontWeight: 600 }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Current active listings</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} xl={6}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#f9f0ff', color: '#722ed1' }}>
                            <SafetyCertificateOutlined />
                        </div>
                        <Statistic
                            title="Applications"
                            value={stats?.totalApplications || 0}
                            valueStyle={{ fontWeight: 600 }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Processed candidates</Text>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} xl={6}>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fff1f0', color: '#ED1B2F' }}>
                            <BellOutlined />
                        </div>
                        <Statistic
                            title="Pending Reviews"
                            value={stats?.pendingJobs || 0}
                            valueStyle={{ fontWeight: 600 }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="warning" style={{ fontSize: 12 }}>Needs attention</Text>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Recent Registrations" className="admin-card">
                        <Table
                            className="admin-table"
                            columns={userColumns}
                            dataSource={users.slice(0, 5)}
                            pagination={false}
                            rowKey="_id"
                        />
                    </Card>
                </Col>
            </Row>
        </AdminLayout>
    );
};

export default AdminDashboard;
