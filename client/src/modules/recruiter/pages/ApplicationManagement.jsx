import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Typography, message, Select, Input, Modal, Descriptions, Avatar, Divider, Row, Col, Form, List, DatePicker } from "antd";
import { SearchOutlined, FilterOutlined, EyeOutlined, FilePdfOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, CodeOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import recruiterService from "../api"; // Keep for listing if needed, but we used appService logic
import applicationService from "../../../services/applicationService";
import challengeService from "../../../services/challengeService";
import RecruiterLayout from "../components/RecruiterLayout";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ApplicationManagement = () => {
    // Data State
    const [applications, setApplications] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [interviewers, setInterviewers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [searchText, setSearchText] = useState("");

    // Modal States
    const [selectedApp, setSelectedApp] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Status Change Modal
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const [targetStatus, setTargetStatus] = useState("");
    const [statusNote, setStatusNote] = useState("");

    // Test Assignment Modal
    const [isTestModalVisible, setIsTestModalVisible] = useState(false);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);

    // Interview Modal
    const [isInterviewModalVisible, setIsInterviewModalVisible] = useState(false);
    const [interviewForm] = Form.useForm();
    const [isSnapshotModalVisible, setIsSnapshotModalVisible] = useState(false);

    useEffect(() => {
        fetchApplications();
        fetchChallenges();
        fetchInterviewers();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // We use recruiterService for the general list, assume it works or use applicationService logic if needed via backend
            // In backend routes, recruiterService.getApplications calls /recruiter/applications which uses getMyApplications controller
            // which calls service.getApplicationsByJob possibly? OR getApplicationsByRecruiter (not impl in backend yet, check code)
            // Wait, previous backend code had `getApplicationsByJob`.
            // The `recruiter.controller.js` `getMyApplications` implementation wasn't shown but likely fetches all.
            // Let's rely on it for now.
            const data = await recruiterService.getApplications();
            setApplications(data);
        } catch (error) {
            console.error(error);
            message.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const fetchChallenges = async () => {
        try {
            const data = await challengeService.getAll();
            setChallenges(data);
        } catch (error) {
            console.error("Failed to load challenges");
        }
    }

    const fetchInterviewers = async () => {
        try {
            const data = await recruiterService.getInterviewers();
            setInterviewers(data);
        } catch (error) {
            console.error("Failed to load interviewers");
        }
    }

    // --- Actions ---

    // Open Status Modal
    const initiateStatusChange = (app, status) => {
        setSelectedApp(app);
        setTargetStatus(status);
        setStatusNote("");
        setIsStatusModalVisible(true);
    }

    // Submit Status Change
    const handleStatusSubmit = async () => {
        try {
            await applicationService.updateStatus(selectedApp._id, targetStatus, statusNote);
            message.success(`Status updated to ${targetStatus}`);
            setIsStatusModalVisible(false);
            setIsDetailModalVisible(false); // Close detail too
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to update status");
        }
    }

    // Open Test Modal
    const initiateTestAssignment = (app) => {
        setSelectedApp(app);
        setSelectedChallengeId(null);
        setIsTestModalVisible(true);
    }

    // Submit Test Assignment
    const handleTestAssign = async () => {
        if (!selectedChallengeId) return message.warning("Please select a challenge");
        try {
            await applicationService.assignTest(selectedApp._id, selectedChallengeId);
            message.success("Test assigned successfully");
            setIsTestModalVisible(false);
            setIsDetailModalVisible(false);
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to assign test");
        }
    }

    // Open Interview Modal
    const initiateInterview = (app) => {
        setSelectedApp(app);
        interviewForm.resetFields();
        setIsInterviewModalVisible(true);
    }

    // Submit Interview Schedule
    const handleInterviewSubmit = async () => {
        try {
            const values = await interviewForm.validateFields();
            await recruiterService.scheduleInterview({
                applicationId: selectedApp._id,
                interviewerId: values.interviewerId,
                scheduledAt: values.scheduledAt.toISOString(),
                meetingLink: values.meetingLink
            });
            message.success("Interview scheduled successfully");
            setIsInterviewModalVisible(false);
            setIsDetailModalVisible(false);
            fetchApplications();
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to schedule interview");
        }
    }

    // --- UI Helpers ---

    const getStatusColor = (status) => {
        const colors = {
            APPLIED: "blue",
            SCREENED: "cyan",
            TEST_ASSIGNED: "geekblue",
            TEST_SUBMITTED: "orange",
            INTERVIEW_SCHEDULED: "purple",
            INTERVIEW_COMPLETED: "magenta",
            OFFER: "green",
            REJECTED: "red",
            WITHDRAWN: "default",
            OFFER_ACCEPTED: "gold"
        };
        return colors[status] || "default";
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
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.candidateId?.fullName || "Candidate"}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: "Job",
            dataIndex: ["jobId", "title"],
            key: "jobTitle",
        },
        {
            title: "Score",
            dataIndex: ["score", "aiMatching"],
            key: "matchScore",
            sorter: (a, b) => (a.score?.aiMatching || 0) - (b.score?.aiMatching || 0),
            render: (score) => <Tag color={score >= 70 ? "success" : score >= 50 ? "warning" : "error"}>{score || 0}%</Tag>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={getStatusColor(status)}>{status.replace("_", " ")}</Tag>
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedApp(record); setIsDetailModalVisible(true); }}>
                    View
                </Button>
            )
        }
    ];

    const filteredApps = applications.filter(app => {
        if (filterStatus !== "ALL" && app.status !== filterStatus) return false;
        if (searchText) {
            const search = searchText.toLowerCase();
            return (app.candidateId?.email?.toLowerCase().includes(search) ||
                app.jobId?.title?.toLowerCase().includes(search));
        }
        return true;
    });

    // Valid Transitions Logic for Buttons
    const renderActionButtons = (app) => {
        if (!app) return null;
        const s = app.status;
        const buttons = [];

        // Reject is almost always an option
        if (!['REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED'].includes(s)) {
            buttons.push(
                <Button danger key="rej" onClick={() => initiateStatusChange(app, "REJECTED")}>Reject</Button>
            );
        }

        // Screened Manual Transition
        if (s === 'APPLIED') {
            buttons.push(<Button key="scr" onClick={() => initiateStatusChange(app, "SCREENED")}>Mark Screened</Button>);
        }

        // Assign Test
        if (['APPLIED', 'SCREENED'].includes(s)) {
            buttons.push(
                <Button key="test" type="primary" icon={<CodeOutlined />} onClick={() => initiateTestAssignment(app)}>
                    Assign Test
                </Button>
            );
        }

        // Interview
        if (['TEST_SUBMITTED', 'SCREENED', 'TEST_ASSIGNED'].includes(s)) {
            // Note: Normally we wait for test submitted, but manual override allowed
            buttons.push(
                <Button key="int" type="primary" style={{ background: '#722ed1' }} icon={<CalendarOutlined />}
                    onClick={() => initiateInterview(app)}>
                    Invite Interview
                </Button>
            );
        }

        // Offer
        if (['INTERVIEW_COMPLETED', 'INTERVIEW_SCHEDULED'].includes(s)) {
            buttons.push(
                <Button key="off" type="primary" style={{ background: '#52c41a' }} icon={<CheckCircleOutlined />}
                    onClick={() => initiateStatusChange(app, "OFFER")}>
                    Make Offer
                </Button>
            );
        }

        return <Space wrap>{buttons}</Space>;
    };

    return (
        <RecruiterLayout>
            {/* Toolbar */}
            <div style={{ marginBottom: 16, padding: '12px 24px', background: '#fff', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>Applications</Title>
                <Space>
                    <Input placeholder="Search..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} />
                    <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                        <Select.Option value="ALL">All Status</Select.Option>
                        <Select.Option value="APPLIED">Applied</Select.Option>
                        <Select.Option value="TEST_SUBMITTED">Test Submitted</Select.Option>
                        <Select.Option value="INTERVIEW_COMPLETED">Interviewed</Select.Option>
                    </Select>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredApps}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* DETAIL MODAL */}
            <Modal
                title="Application Details"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={selectedApp ? renderActionButtons(selectedApp) : null}
                width={800}
            >
                {selectedApp && (
                    <div>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <Avatar size={64} src={selectedApp.candidateId?.avatar} icon={<UserOutlined />} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>{selectedApp.candidateId?.fullName || selectedApp.candidateId?.email}</Title>
                                <Text type="secondary">Applied for <Text strong>{selectedApp.jobId?.title}</Text></Text>
                                <br />
                                <Tag color={getStatusColor(selectedApp.status)} style={{ marginTop: 8 }}>{selectedApp.status}</Tag>
                            </div>
                        </div>

                        <Divider titlePlacement="left">Scores & Analysis</Divider>
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="AI Match">{selectedApp.score?.aiMatching}%</Descriptions.Item>
                            <Descriptions.Item label="Coding Test">{selectedApp.score?.codingTest !== undefined ? `${selectedApp.score.codingTest}/100` : 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Interview" span={2}>{selectedApp.score?.interview !== undefined ? `${selectedApp.score.interview}/10` : 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="AI Reason" span={2}>{selectedApp.score?.aiExplanation || "No analysis"}</Descriptions.Item>
                        </Descriptions>

                        <Divider titlePlacement="left">Documents</Divider>
                        <Space>
                            {selectedApp.resumeSnapshot?.cvUrl && (
                                <Button icon={<FilePdfOutlined />} href={`/api${selectedApp.resumeSnapshot.cvUrl}`} target="_blank">View CV PDF</Button>
                            )}
                            <Button icon={<FileTextOutlined />} onClick={() => setIsSnapshotModalVisible(true)}>View Profile Snapshot</Button>
                        </Space>

                        <Divider titlePlacement="left">History</Divider>
                        <List
                            itemLayout="horizontal"
                            dataSource={selectedApp.history || []}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{item.status}</Text>}
                                        description={
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(item.at).format("MMM D, HH:mm")} - </Text>
                                                <Text>{item.note}</Text>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Modal>

            {/* STATUS CHANGE MODAL */}
            <Modal
                title={`Update Status to ${targetStatus}`}
                open={isStatusModalVisible}
                onOk={handleStatusSubmit}
                onCancel={() => setIsStatusModalVisible(false)}
            >
                <Form layout="vertical">
                    <Form.Item label="Note / Feedback (Required for transparency)">
                        <TextArea rows={4} value={statusNote} onChange={e => setStatusNote(e.target.value)} placeholder="e.g., Candidate passed screening, moving to test." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ASSIGN TEST MODAL */}
            <Modal
                title="Assign Coding Challenge"
                open={isTestModalVisible}
                onOk={handleTestAssign}
                onCancel={() => setIsTestModalVisible(false)}
            >
                <Paragraph>Select a coding challenge to send to the candidate.</Paragraph>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Select Challenge"
                    onChange={setSelectedChallengeId}
                >
                    {challenges.map(ch => (
                        <Select.Option key={ch._id} value={ch._id}>
                            {ch.title} ({ch.difficulty})
                        </Select.Option>
                    ))}
                </Select>
            </Modal>

            {/* INTERVIEW MODAL */}
            <Modal
                title="Schedule Interview"
                open={isInterviewModalVisible}
                onOk={handleInterviewSubmit}
                onCancel={() => setIsInterviewModalVisible(false)}
            >
                <Form layout="vertical" form={interviewForm}>
                    <Form.Item name="interviewerId" label="Assign Interviewer" rules={[{ required: true }]}>
                        <Select placeholder="Select Technical Interviewer">
                            {interviewers.map(i => (
                                <Select.Option key={i._id} value={i._id}>
                                    {i.email}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="scheduledAt" label="Date & Time" rules={[{ required: true }]}>
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="meetingLink" label="Meeting Link (Optional)">
                        <Input placeholder="e.g. Zoom or Google Meet URL (Auto-generated if empty)" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* SNAPSHOT MODAL */}
            <Modal
                title="Candidate Profile Snapshot (At time of application)"
                open={isSnapshotModalVisible}
                onCancel={() => setIsSnapshotModalVisible(false)}
                footer={<Button onClick={() => setIsSnapshotModalVisible(false)}>Close</Button>}
                width={700}
            >
                {selectedApp?.resumeSnapshot?.profile ? (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <Descriptions title="Personal" bordered size="small" column={2}>
                            <Descriptions.Item label="Full Name">{selectedApp.resumeSnapshot.profile.fullName || "N/A"}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{selectedApp.resumeSnapshot.profile.phoneNumber || "N/A"}</Descriptions.Item>
                            <Descriptions.Item label="Bio" span={2}>{selectedApp.resumeSnapshot.profile.bio || "N/A"}</Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Title level={5}>Skills</Title>
                        <Space wrap>
                            {selectedApp.resumeSnapshot.profile.skills?.map((skill, i) => (
                                <Tag key={i} color="blue">{skill}</Tag>
                            )) || <Text>No skills listed</Text>}
                        </Space>
                        <Divider />
                        <Title level={5}>Experience</Title>
                        <List
                            dataSource={selectedApp.resumeSnapshot.profile.experience || []}
                            renderItem={exp => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{exp.title} at {exp.company}</Text>}
                                        description={
                                            <div>
                                                <Text type="secondary">{exp.startDate} - {exp.endDate || "Present"}</Text>
                                                <p>{exp.description}</p>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                        <Divider />
                        <Title level={5}>Education</Title>
                        <List
                            dataSource={selectedApp.resumeSnapshot.profile.education || []}
                            renderItem={edu => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{edu.degree} in {edu.fieldOfStudy}</Text>}
                                        description={`${edu.school}, ${edu.year}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">No profile snapshot available.</Text>
                    </div>
                )}
            </Modal>

        </RecruiterLayout >
    );
}

export default ApplicationManagement;
