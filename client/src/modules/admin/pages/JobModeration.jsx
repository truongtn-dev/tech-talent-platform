import { useState, useEffect } from "react";
import {
    Table, Tag, Space, Button, Typography, message, Card, Tooltip
} from "antd";
import {
    CheckCircleOutlined,
    StopOutlined,
    EyeOutlined,
    ProjectOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

const { Text } = Typography;

const JobModeration = () => {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllJobs();
            setJobs(data);
        } catch (error) {
            message.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (jobId) => {
        try {
            await adminService.approveJob(jobId);
            message.success("Job approved");
            fetchJobs();
        } catch (error) {
            message.error("Action failed");
        }
    };

    const handleHide = async (jobId) => {
        try {
            await adminService.hideJob(jobId);
            message.success("Job hidden");
            fetchJobs();
        } catch (error) {
            message.error("Action failed");
        }
    };

    const columns = [
        {
            title: 'Job Details',
            key: 'details',
            render: (_, record) => (
                <Space>
                    <div style={{
                        width: 40, height: 40, background: '#f0f5ff',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ProjectOutlined style={{ color: '#1890ff' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{record.company || 'Unknown Company'}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Posted By',
            dataIndex: 'creator',
            key: 'creator',
            render: (creator) => creator?.email || 'Unknown'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'PUBLISHED') color = 'success';
                if (status === 'PENDING') color = 'warning';
                if (status === 'HIDDEN') color = 'error';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button icon={<EyeOutlined />} size="small" />
                    </Tooltip>
                    {record.status === 'PENDING' && (
                        <Tooltip title="Approve">
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record._id)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {record.status !== 'HIDDEN' && (
                        <Tooltip title="Hide Job">
                            <Button
                                danger
                                size="small"
                                icon={<StopOutlined />}
                                onClick={() => handleHide(record._id)}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <AdminLayout title="Manage Jobs">
            <Card className="admin-card">
                <Table
                    className="admin-table"
                    columns={columns}
                    dataSource={jobs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>
        </AdminLayout>
    );
};

export default JobModeration;
