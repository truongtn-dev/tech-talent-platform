import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Card, Typography, Tooltip, Progress, message, Select, Input, Modal, Descriptions, Avatar, Divider, Row, Col } from "antd";
import { SearchOutlined, FilterOutlined, EyeOutlined, FilePdfOutlined, UserOutlined } from "@ant-design/icons";
import recruiterService from "../api";
import RecruiterLayout from "../components/RecruiterLayout";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const ApplicationManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchText, setSearchText] = useState("");

    // Modal State
    const [selectedApp, setSelectedApp] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await recruiterService.getApplications();
            setApplications(data);
        } catch (error) {
            message.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await recruiterService.updateApplicationStatus(id, newStatus);
            message.success(`Status updated to ${newStatus}`);
            fetchApplications();
            if (selectedApp && selectedApp._id === id) {
                // Close modal if open to refresh or update local state
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const viewDetails = (app) => {
        setSelectedApp(app);
        setIsModalVisible(true);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "#10B981";
        if (score >= 60) return "#F59E0B";
        return "#EF4444";
    };

    const columns = [
        {
            title: "Candidate",
            key: "candidate",
            render: (_, record) => (
                <Space>
                    <Avatar src={record.candidateId?.avatar} icon={<UserOutlined />} />
                    <div>
                        <Text strong style={{ display: "block" }}>{record.candidateId?.email}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.candidateId?.profile?.fullName || "No Name"}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: "Applied Job",
            dataIndex: ["jobId", "title"],
            key: "jobTitle",
        },
        {
            title: "Match Score",
            dataIndex: "matchingScore",
            key: "matchScore",
            sorter: (a, b) => a.matchingScore - b.matchingScore,
            render: (score) => (
                <Tag color={getScoreColor(score)}>{score}%</Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const colorMap = {
                    APPLIED: "blue", SCREENED: "cyan", TEST_SENT: "orange",
                    INTERVIEW: "purple", OFFER: "success", REJECTED: "error"
                };
                return <Tag color={colorMap[status]}>{status}</Tag>;
            }
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetails(record)}>
                    Details
                </Button>
            )
        }
    ];

    const filteredApps = applications.filter(app => {
        const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
        const matchesSearch = (app.candidateId?.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
            (app.jobId?.title || "").toLowerCase().includes(searchText.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <RecruiterLayout>
            {/* Header / Toolbar */}
            <div style={{
                marginBottom: 16,
                padding: '8px 24px',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                    <FilePdfOutlined style={{ marginRight: 10, fontSize: '20px', color: '#4F46E5' }} />
                    Application Management
                </Title>
                <Space size="small">
                    <Input
                        className="custom-search-input"
                        prefix={<SearchOutlined />}
                        placeholder="Search candidate or job..."
                        style={{ width: 280, borderRadius: 6, fontSize: '13px' }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: 140 }}
                        className="custom-select"
                    >
                        <Select.Option value="ALL">All Status</Select.Option>
                        <Select.Option value="APPLIED">Applied</Select.Option>
                        <Select.Option value="INTERVIEW">Interview</Select.Option>
                        <Select.Option value="OFFER">Offer</Select.Option>
                    </Select>
                    <Button icon={<FilterOutlined />} style={{ borderRadius: 6 }} />
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredApps}
                rowKey="_id"
                loading={loading}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
            />

            <style>{`
                .custom-search-input.ant-input-affix-wrapper {
                    padding: 0 !important;
                    height: 36px !important;
                    display: flex !important;
                    align-items: center !important;
                    overflow: hidden !important;
                    border-radius: 6px !important;
                    border: 1px solid #e5e7eb !important;
                }
                .custom-search-input .ant-input-prefix {
                    margin: 0 !important;
                    height: 100% !important;
                    background: #4F46E5;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 0 12px !important;
                    color: #fff !important;
                }
                .custom-search-input .ant-input-prefix .anticon {
                    color: #fff !important;
                    font-size: 16px !important;
                }
                .custom-search-input .ant-input {
                    height: 100% !important;
                    padding: 0 12px !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .custom-search-input.ant-input-affix-wrapper:hover,
                .custom-search-input.ant-input-affix-wrapper:focus,
                .custom-search-input.ant-input-affix-wrapper-focused {
                    border-color: #4F46E5 !important;
                    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
                }
            `}</style>

            <Modal
                title="Application Details"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>Close</Button>,
                    <Button key="reject" danger onClick={() => handleStatusChange(selectedApp._id, "REJECTED")}>Reject</Button>,
                    <Button key="interview" type="primary" onClick={() => handleStatusChange(selectedApp._id, "INTERVIEW")}>Move to Interview</Button>
                ]}
                width={800}
            >
                {selectedApp && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <Avatar size={64} src={selectedApp.candidateId?.avatar} icon={<UserOutlined />} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>{selectedApp.candidateId?.profile?.fullName || "Candidate"}</Title>
                                <Text type="secondary">{selectedApp.candidateId?.email}</Text>
                            </div>
                            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                <Text type="secondary" style={{ display: 'block' }}>Applied for</Text>
                                <Text strong style={{ fontSize: 16, color: '#4F46E5' }}>{selectedApp.jobId?.title}</Text>
                            </div>
                        </div>

                        <Divider />

                        <Row gutter={24}>
                            <Col span={12}>
                                <Descriptions title="Candidate Info" column={1}>
                                    <Descriptions.Item label="Matching Score">
                                        <Text strong style={{ color: getScoreColor(selectedApp.matchingScore) }}>{selectedApp.matchingScore}%</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Current Status">
                                        <Tag>{selectedApp.status}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Applied Date">
                                        {dayjs(selectedApp.createdAt).format("MMMM DD, YYYY")}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12}>
                                <Descriptions title="Documents" column={1}>
                                    <Descriptions.Item label="CV / Resume">
                                        {selectedApp.cvType === 'UPLOAD' ? (
                                            <Button type="link" icon={<FilePdfOutlined />} href={`/api/uploads/${selectedApp.cvRef}`} target="_blank">
                                                Download CV
                                            </Button>
                                        ) : (
                                            <Button type="link" href={`/profile/${selectedApp.cvRef}`} target="_blank">
                                                View Online Profile
                                            </Button>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cover Letter">
                                        <Text type="secondary" italic>No cover letter provided.</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>

                        <Divider />

                        <Title level={5}>AI Analysis</Title>
                        <Card style={{ background: '#f8fafc', borderRadius: 8 }} bordered={false}>
                            <Text>
                                {selectedApp.matchingReason || "No AI analysis available for this application yet."}
                            </Text>
                        </Card>
                    </div>
                )}
            </Modal>
        </RecruiterLayout>
    );
};

export default ApplicationManagement;
