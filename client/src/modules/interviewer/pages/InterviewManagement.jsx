import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Card, Typography, Modal, Form, Input, Select, Rate, Divider, message, Avatar, Row, Col, DatePicker } from "antd";
import { VideoCameraOutlined, PlusOutlined, FormOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import InterviewerLayout from "../components/InterviewerLayout";
import interviewerService from "../api";
import dayjs from "dayjs";

const { Text } = Typography;

const InterviewManagement = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEvalModalVisible, setIsEvalModalVisible] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [isManageModalVisible, setIsManageModalVisible] = useState(false);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [availableApps, setAvailableApps] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const [manageForm] = Form.useForm();
    const [scheduleForm] = Form.useForm();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const data = await interviewerService.getInterviews();
            setInterviews(data);
        } catch (error) {
            message.error("Failed to load interview sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluation = (interview) => {
        setSelectedInterview(interview);
        form.setFieldsValue(interview.evaluation || {});
        setIsEvalModalVisible(true);
    };

    const submitEvaluation = async (values) => {
        try {
            await interviewerService.submitEvaluation(selectedInterview._id, values);
            message.success("Evaluation recorded successfully");
            setIsEvalModalVisible(false);
            fetchInterviews();
        } catch (error) {
            message.error("Failed to submit assessment");
        }
    };

    const handleManage = (interview) => {
        setSelectedInterview(interview);
        manageForm.setFieldsValue({
            scheduledAt: dayjs(interview.scheduledAt),
            meetingLink: interview.meetingLink,
            status: interview.status
        });
        setIsManageModalVisible(true);
    };

    const submitManage = async (values) => {
        try {
            await interviewerService.updateInterviewSession(selectedInterview._id, values);
            message.success("Session updated successfully");
            setIsManageModalVisible(false);
            fetchInterviews();
        } catch (error) {
            message.error("Failed to update session");
        }
    };

    const handleSchedule = async () => {
        setIsScheduleModalVisible(true);
        try {
            const data = await interviewerService.getAvailableApplications();
            setAvailableApps(data);
        } catch (error) {
            message.error("Failed to load available candidates");
        }
    };

    const submitSchedule = async (values) => {
        try {
            await interviewerService.createInterviewSession(values);
            message.success("Interview scheduled successfully");
            setIsScheduleModalVisible(false);
            scheduleForm.resetFields();
            fetchInterviews();
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to schedule interview");
        }
    };

    const handleJoinRoom = (link) => {
        if (!link) {
            message.warning("Meeting link not available yet");
            return;
        }
        window.open(link, '_blank');
    };

    const filteredInterviews = interviews.filter(item =>
        item.candidateId?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.applicationId?.jobId?.title?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Candidate",
            key: "candidate",
            render: (_, record) => (
                <Space>
                    <Avatar src={record.candidateId?.avatar} style={{ background: '#10B981' }}>
                        {record.candidateId?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block' }}>{record.candidateId?.email}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Applied: {dayjs(record.createdAt).format("MMM DD")}</Text>
                    </div>
                </Space>
            )
        },
        { title: "Target Position", dataIndex: ["applicationId", "jobId", "title"], key: "job" },
        {
            title: "Schedule",
            key: "time",
            render: (_, record) => (
                <div>
                    <Tag color="blue" style={{ borderRadius: 4 }}>{dayjs(record.scheduledAt).format("YYYY-MM-DD")}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(record.scheduledAt).format("HH:mm")}</Text>
                </div>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const colors = { INTERVIEW: "processing", COMPLETED: "success", CANCELLED: "error" };
                return <Tag color={colors[status] || "default"} style={{ fontWeight: 600 }}>{status}</Tag>;
            }
        },
        {
            title: "Quick Action",
            key: "action",
            align: 'right',
            render: (_, record) => (
                <Space>
                    {record.status === 'SCHEDULED' && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<VideoCameraOutlined />}
                            onClick={() => handleJoinRoom(record.meetingLink)}
                            style={{ background: '#10B981', borderColor: '#10B981', borderRadius: 6 }}
                        >
                            Join Room
                        </Button>
                    )}
                    <Button
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => handleManage(record)}
                        style={{ borderRadius: 6 }}
                    >
                        Manage
                    </Button>
                    <Button
                        size="small"
                        icon={<FormOutlined />}
                        onClick={() => handleEvaluation(record)}
                        style={{ borderRadius: 6 }}
                    >
                        Assess
                    </Button>
                </Space>
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
                <Typography.Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                    <VideoCameraOutlined style={{ marginRight: 10, fontSize: '20px', color: '#10B981' }} />
                    Interview Sessions
                </Typography.Title>
                <Space size="middle">
                    <Input
                        className="interviewer-search-input"
                        placeholder="Filter candidates or roles..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleSchedule}
                        style={{
                            background: '#10B981',
                            borderColor: '#10B981',
                            borderRadius: 8,
                            height: 40,
                            fontWeight: 600
                        }}
                    >
                        Schedule Interview
                    </Button>
                </Space>
            </div>

            {/* Table Card */}
            <div style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
                padding: '1px',
                overflow: 'hidden'
            }}>
                <Table
                    columns={columns}
                    dataSource={filteredInterviews}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    bordered={false}
                    className="admin-table"
                />
            </div>

            <Modal
                title={<span style={{ fontWeight: 700 }}>Technical Assessment: {selectedInterview?.candidateId?.email}</span>}
                open={isEvalModalVisible}
                onCancel={() => setIsEvalModalVisible(false)}
                onOk={() => form.submit()}
                width={700}
                okText="Complete Assessment"
                okButtonProps={{ style: { background: '#10B981', borderColor: '#10B981', borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
            >
                <Form form={form} layout="vertical" onFinish={submitEvaluation} style={{ marginTop: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24, padding: '16px', borderRadius: 12, background: '#f8fafc' }}>
                        <Text strong style={{ display: 'block', marginBottom: 12 }}>Overall Technical Proficiency</Text>
                        <Form.Item name="score" rules={[{ required: true }]}>
                            <Rate allowHalf style={{ fontSize: 36, color: '#10B981' }} />
                        </Form.Item>
                    </div>

                    <Divider orientation="left">Criteria Check</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="codingAbility" label="Coding Logic & Execution">
                                <Select placeholder="Evaluate skill" style={{ borderRadius: 8 }}>
                                    <Select.Option value="5">Exemplary</Select.Option>
                                    <Select.Option value="4">Proficient</Select.Option>
                                    <Select.Option value="3">Competent</Select.Option>
                                    <Select.Option value="2">Developing</Select.Option>
                                    <Select.Option value="1">Unsatisfactory</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="communication" label="Problem Breakdown (Comm)">
                                <Select placeholder="Evaluate skill" style={{ borderRadius: 8 }}>
                                    <Select.Option value="5">Exemplary</Select.Option>
                                    <Select.Option value="4">Proficient</Select.Option>
                                    <Select.Option value="3">Competent</Select.Option>
                                    <Select.Option value="2">Developing</Select.Option>
                                    <Select.Option value="1">Unsatisfactory</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="notes" label="Technical Interview Observations" rules={[{ required: true }]}>
                        <Input.TextArea rows={6} placeholder="Detailed notes on algorithm choices, code cleaniness, and architecture understanding..." style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="recommendation" label="Interviewer Verdict" initialValue="HIRE">
                        <Select style={{ borderRadius: 8 }}>
                            <Select.Option value="HIRE">Recommended for Next Round</Select.Option>
                            <Select.Option value="CONSIDER">Neutral / Borderline</Select.Option>
                            <Select.Option value="REJECT">Not Suitable</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Schedule New Interview Modal */}
            <Modal
                title={<span style={{ fontWeight: 700 }}>Schedule New Interview</span>}
                open={isScheduleModalVisible}
                onCancel={() => setIsScheduleModalVisible(false)}
                onOk={() => scheduleForm.submit()}
                width={600}
                okText="Schedule Now"
                okButtonProps={{ style: { background: '#10B981', borderColor: '#10B981', borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
            >
                <Form form={scheduleForm} layout="vertical" onFinish={submitSchedule} style={{ marginTop: 20 }}>
                    <Form.Item name="applicationId" label="Select Candidate / Job" rules={[{ required: true, message: 'Please select a candidate' }]}>
                        <Select
                            placeholder="Find qualified candidates..."
                            style={{ borderRadius: 8 }}
                            showSearch
                            optionFilterProp="children"
                        >
                            {availableApps.map(app => (
                                <Select.Option key={app._id} value={app._id}>
                                    <Space>
                                        <Text strong>{app.candidateId?.email}</Text>
                                        <Tag color="cyan">{app.jobId?.title}</Tag>
                                        <Text type="secondary" style={{ fontSize: 12 }}>({app.status})</Text>
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="scheduledAt" label="Interview Time" rules={[{ required: true }]}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="meetingLink" label="Meeting Link (Google Meet, etc.)">
                        <Input placeholder="https://meet.google.com/..." style={{ borderRadius: 8 }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Manage Session Modal */}
            <Modal
                title={<span style={{ fontWeight: 700 }}>Manage Interview Session</span>}
                open={isManageModalVisible}
                onCancel={() => setIsManageModalVisible(false)}
                onOk={() => manageForm.submit()}
                width={500}
                okText="Save Changes"
                okButtonProps={{ style: { background: '#10B981', borderColor: '#10B981', borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
            >
                <Form form={manageForm} layout="vertical" onFinish={submitManage} style={{ marginTop: 20 }}>
                    <Form.Item name="scheduledAt" label="Scheduled Time" rules={[{ required: true }]}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="meetingLink" label="Meeting Link (Google Meet, Zoom, etc.)">
                        <Input placeholder="https://meet.google.com/..." style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item name="status" label="Session Status">
                        <Select style={{ borderRadius: 8 }}>
                            <Select.Option value="SCHEDULED">Scheduled</Select.Option>
                            <Select.Option value="COMPLETED">Completed</Select.Option>
                            <Select.Option value="CANCELLED">Cancelled</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            {/* Inject styles for Emerald theme and custom search */}
            <style>{`
                .interviewer-search-input.ant-input-affix-wrapper {
                    padding: 0 !important;
                    height: 40px !important;
                    overflow: hidden;
                    border-radius: 8px !important;
                    border: 1px solid #e5e7eb !important;
                    transition: all 0.3s;
                }
                .interviewer-search-input .ant-input-prefix {
                    margin: 0 !important;
                    height: 100% !important;
                    background: #10B981;
                    padding: 0 12px !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .interviewer-search-input .ant-input-prefix .anticon {
                    color: #fff !important;
                    font-size: 16px;
                }
                .interviewer-search-input .ant-input {
                    padding: 0 12px !important;
                    border: none !important;
                    height: 100% !important;
                }
                .interviewer-search-input:hover, .interviewer-search-input-focused {
                    border-color: #10B981 !important;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1) !important;
                }
            `}</style>
        </InterviewerLayout>
    );
};

export default InterviewManagement;
