import { useState, useEffect } from "react";
import { Table, Button, Space, Popconfirm, message, Tag, Image, Card, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import jobService from "../api";
import { useAuth } from "../../../context/AuthContext";

const { Title } = Typography;

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await jobService.getAllJobs();
            setJobs(data.jobs || data || []);
        } catch (error) {
            message.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await jobService.deleteJob(id);
            message.success("Job deleted successfully");
            fetchJobs();
        } catch (error) {
            message.error("Failed to delete job");
        }
    };

    const columns = [
        {
            title: "Thumbnail",
            dataIndex: "thumbnail",
            key: "thumbnail",
            width: 100,
            render: (thumbnail) => (
                thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt="Job"
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    />
                ) : (
                    <div style={{ width: 60, height: 60, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        No Image
                    </div>
                )
            ),
        },
        {
            title: "Job Title",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.company}</div>
                </div>
            ),
        },
        {
            title: "Location",
            dataIndex: "location",
            key: "location",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => type?.replace("_", " ") || "N/A",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const colors = {
                    DRAFT: "default",
                    PUBLISHED: "green",
                    CLOSED: "red",
                };
                return <Tag color={colors[status]}>{status}</Tag>;
            },
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/jobs/${record._id}`)}
                        size="small"
                    >
                        View
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/jobs/edit/${record._id}`)}
                        size="small"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this job?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
                <Card style={{ borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                        <Title level={2} style={{ margin: 0 }}>
                            Manage Jobs
                        </Title>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/jobs/create")}
                            size="large"
                            style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
                        >
                            Create New Job
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={jobs}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} jobs`,
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default ManageJobs;
