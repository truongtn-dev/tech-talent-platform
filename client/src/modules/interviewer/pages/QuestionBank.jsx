import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, Typography, Row, Col, Divider } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from "@ant-design/icons";
import InterviewerLayout from "../components/InterviewerLayout";
import interviewerService from "../api";

const { Text } = Typography;

const QuestionBank = () => {
    const [questions, setQuestions] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    useEffect(() => {
        fetchQuestions();
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await interviewerService.getJobs();
            setJobs(data);
        } catch (error) {
            console.error("Failed to load jobs", error);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const data = await interviewerService.getQuestions();
            setQuestions(data);
        } catch (error) {
            message.error("Failed to load questions");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            if (editingQuestion) {
                await interviewerService.updateQuestion(editingQuestion._id, values);
                message.success("Question updated successfully");
            } else {
                await interviewerService.createQuestion(values);
                message.success("New question added to bank");
            }
            setIsModalVisible(false);
            fetchQuestions();
        } catch (error) {
            message.error("Action failed. Please try again.");
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Remove Question?",
            content: "This will remove the question permanently from the bank.",
            okType: 'danger',
            okText: 'Delete',
            onOk: async () => {
                try {
                    await interviewerService.deleteQuestion(id);
                    message.success("Question removed");
                    fetchQuestions();
                } catch (error) {
                    message.error("Failed to delete question");
                }
            }
        });
    };

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchText.toLowerCase()) ||
        q.category.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Problem Statement",
            dataIndex: "title",
            key: "title",
            render: (text) => <Text strong style={{ fontSize: 14 }}>{text}</Text>
        },
        {
            title: "Difficulty",
            dataIndex: "difficulty",
            key: "difficulty",
            render: (difficulty) => {
                const colors = { EASY: "#10B981", MEDIUM: "#F59E0B", HARD: "#EF4444" };
                return <Tag color={colors[difficulty]} style={{ borderRadius: 4, fontWeight: 700, border: 'none', color: '#fff' }}>{difficulty}</Tag>;
            }
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (cat) => <Tag style={{ borderRadius: 4 }}>{cat}</Tag>
        },
        {
            title: "Target Job",
            dataIndex: "jobId",
            key: "job",
            render: (job) => job ? <Tag color="blue" style={{ borderRadius: 4 }}>{job.title}</Tag> : <Text type="secondary">N/A</Text>
        },
        {
            title: "Actions",
            key: "actions",
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#6366f1' }} />}
                        onClick={() => {
                            setEditingQuestion(record);
                            form.setFieldsValue(record);
                            setIsModalVisible(true);
                        }}
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
                        onClick={() => handleDelete(record._id)}
                    />
                </Space>
            )
        }
    ];

    return (
        <InterviewerLayout>
            {/* Header Card */}
            <div style={{
                marginBottom: 16,
                padding: '12px 24px',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography.Title level={4} style={{ margin: 0, fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center' }}>
                    <BookOutlined style={{ marginRight: 10, fontSize: '20px', color: '#10B981' }} />
                    Question Bank
                </Typography.Title>
                <Space size="middle">
                    <Input
                        className="interviewer-search-input"
                        placeholder="Search questions by title or tag..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 320 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingQuestion(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                        style={{
                            background: '#10B981',
                            borderColor: '#10B981',
                            borderRadius: 8,
                            height: 40,
                            fontWeight: 600,
                            padding: '0 20px'
                        }}
                    >
                        Create Question
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
                    dataSource={filteredQuestions}
                    loading={loading}
                    rowKey="_id"
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    bordered={false}
                    className="admin-table"
                />
            </div>

            <Modal
                title={<span style={{ fontSize: 18, fontWeight: 700 }}>{editingQuestion ? "Modify Technical Question" : "New Technical Task"}</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                width={850}
                okText="Save Question"
                okButtonProps={{ style: { background: '#10B981', borderColor: '#10B981', borderRadius: 8 } }}
                cancelButtonProps={{ style: { borderRadius: 8 } }}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} style={{ marginTop: 20 }}>
                    <Row gutter={24}>
                        <Col span={16}>
                            <Form.Item name="title" label="Question Title" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Implement a Debounce function" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="difficulty" label="Skill Level" rules={[{ required: true }]}>
                                <Select style={{ borderRadius: 8 }}>
                                    <Select.Option value="EASY">Easy (Entry Level)</Select.Option>
                                    <Select.Option value="MEDIUM">Medium (Associate)</Select.Option>
                                    <Select.Option value="HARD">Hard (Senior/Spec)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="category" label="Topic Tag" initialValue="Coding">
                                <Input placeholder="e.g. JavaScript, AWS, System Design" style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="jobId" label="Target Job Posting" rules={[{ required: true, message: 'Please link this question to a job' }]}>
                                <Select placeholder="Select the job this question belongs to" style={{ borderRadius: 8 }} allowClear>
                                    {jobs.map(job => (
                                        <Select.Option key={job._id} value={job._id}>
                                            {job.title} - {job.company}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Problem Narrative & Constraints" rules={[{ required: true }]}>
                        <Input.TextArea rows={6} placeholder="Provide a detailed explanation of the task, including edge cases and performance requirements..." style={{ borderRadius: 8 }} />
                    </Form.Item>
                    <Divider orientation="left">Visual Examples (Optional)</Divider>
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="sampleInput" label="Input Example">
                                <Input.TextArea rows={3} placeholder="Provide sample input data..." style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sampleOutput" label="Output Example">
                                <Input.TextArea rows={3} placeholder="Provide expected output..." style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>
                    </Row>
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

export default QuestionBank;
