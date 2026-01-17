import React, { useState, useEffect } from "react";
import {
    Table, Tag, Space, Button, Typography, message,
    Modal, Form, Input, Select, Tooltip, Row, Col, Popconfirm, Avatar, DatePicker
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    ProjectOutlined,
    DeleteOutlined,
    ReloadOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import RecruiterLayout from "../components/RecruiterLayout";
import recruiterService from "../api";
import ImageUpload from "../../../components/common/ImageUpload";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const { Title, Text } = Typography;

const RecruiterJobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const { quill, quillRef } = useQuill({
        theme: "snow",
        placeholder: "Write detailed job description, responsibilities, and benefits...",
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "clean"],
            ],
        },
    });

    useEffect(() => {
        if (!quill) return;
        quill.on("text-change", () => {
            form.setFieldValue("description", quill.root.innerHTML);
        });
    }, [quill, form]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const data = await recruiterService.getMyJobs();
            setJobs(data);
        } catch {
            message.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (title) => {
        if (editingJob || !title) return;
        const slug = title
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        form.setFieldsValue({ slug });
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        const description = quill ? quill.root.innerHTML : "";
        const submissionData = {
            ...values,
            description,
            applicationDeadline: values.applicationDeadline ? values.applicationDeadline.toISOString() : null
        };

        try {
            if (editingJob) {
                await recruiterService.updateJob(editingJob._id, submissionData);
                message.success("Job updated successfully");
            } else {
                await recruiterService.createJob(submissionData);
                message.success("Job created and pending approval");
            }
            setIsModalVisible(false);
            setEditingJob(null);
            form.resetFields();
            if (quill) quill.root.innerHTML = "";
            fetchJobs();
        } catch (error) {
            message.error(error.message || "Failed to save job");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Are you sure you want to delete this job?",
            content: "This action cannot be undone.",
            okText: "Yes, Delete",
            okType: "danger",
            onOk: async () => {
                try {
                    await recruiterService.deleteJob(id);
                    message.success("Job deleted");
                    fetchJobs();
                } catch (error) {
                    message.error("Failed to delete job");
                }
            }
        });
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        form.setFieldsValue({
            ...job,
            applicationDeadline: job.applicationDeadline ? dayjs(job.applicationDeadline) : null,
        });

        if (quill && job.description) {
            quill.root.innerHTML = job.description;
        } else if (quill) {
            quill.root.innerHTML = "";
        }
        setIsModalVisible(true);
    };

    const filteredJobs = jobs.filter(
        (job) =>
            job.title.toLowerCase().includes(searchText.toLowerCase()) ||
            job.company.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "No.",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Job Details",
            key: "details",
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.thumbnail}
                        icon={<ProjectOutlined />}
                        size="large"
                        shape="square"
                        style={{ borderRadius: 8 }}
                    />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                            {record.company} • {record.location}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Type / Level",
            width: 150,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag>{record.type}</Tag>
                    <Tag color="orange">{record.level}</Tag>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            align: "center",
            render: (status) => {
                const map = {
                    PUBLISHED: "success",
                    PENDING: "processing",
                    CLOSED: "error",
                    DRAFT: "default",
                };
                return <Tag color={map[status]}>{status || "DRAFT"}</Tag>;
            },
        },
        {
            title: "Applications",
            dataIndex: "applicationCount",
            align: "center",
            render: (count) => <Tag color="blue" style={{ borderRadius: 10, padding: '0 8px' }}>{count || 0}</Tag>
        },
        {
            title: "Posted Date",
            dataIndex: "createdAt",
            render: (date) => dayjs(date).format("MMM DD, YYYY"),
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record._id)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

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
                    <ProjectOutlined style={{ marginRight: 10, fontSize: '20px', color: '#4F46E5' }} />
                    Job Management
                </Title>
                <Space size="small">
                    <Input
                        className="custom-search-input"
                        prefix={<SearchOutlined />}
                        placeholder="Search by title or company..."
                        style={{ width: 280, borderRadius: 6, fontSize: '13px' }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Button icon={<ReloadOutlined />} onClick={fetchJobs} style={{ borderRadius: 6 }} />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingJob(null);
                            form.resetFields();
                            if (quill) quill.root.innerHTML = "";
                            setIsModalVisible(true);
                        }}
                        style={{
                            background: '#4F46E5',
                            borderColor: '#4F46E5',
                            borderRadius: 6,
                            fontWeight: 600,
                            height: 36,
                            padding: '0 16px'
                        }}
                    >
                        Post New Job
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredJobs}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 8 }}
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
                title={editingJob ? "Update Job Details" : "Post a New Job"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1000}
                centered
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    onValuesChange={(changedValues) => {
                        if (changedValues.title !== undefined) {
                            handleTitleChange(changedValues.title);
                        }
                    }}
                    initialValues={{
                        type: "FULL_TIME",
                        level: "MID",
                        status: "PENDING",
                    }}
                >
                    <Row gutter={24}>
                        {/* Left Column: Media & Core Info */}
                        <Col span={8} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                            <div style={{ marginBottom: 16 }}>
                                <Form.Item name="thumbnail" noStyle>
                                    <ImageUpload />
                                </Form.Item>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                                    Upload Job Thumbnail (Optional)
                                </div>
                            </div>

                            <Form.Item name="type" label="Job Type" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="FULL_TIME">Full Time</Select.Option>
                                    <Select.Option value="PART_TIME">Part Time</Select.Option>
                                    <Select.Option value="CONTRACT">Contract</Select.Option>
                                    <Select.Option value="INTERNSHIP">Internship</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="level" label="Experience Level" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="JUNIOR">Junior</Select.Option>
                                    <Select.Option value="MID">Mid Level</Select.Option>
                                    <Select.Option value="SENIOR">Senior</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="status" label="Posting Status" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="PUBLISHED">Published (Request)</Select.Option>
                                    <Select.Option value="DRAFT">Draft</Select.Option>
                                    <Select.Option value="CLOSED">Closed</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="applicationDeadline" label="Deadline">
                                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" suffixIcon={<CalendarOutlined />} />
                            </Form.Item>
                        </Col>

                        {/* Right Column: Detailed Content */}
                        <Col span={16}>
                            <Form.Item
                                name="title"
                                label="Job Title"
                                rules={[{ required: true, message: 'Job title is required' }]}
                            >
                                <Input placeholder="e.g. Senior Frontend Engineer" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="company" label="Company Name" rules={[{ required: true }]}>
                                        <Input placeholder="Company name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="slug" label="Slug (URL Path)" rules={[{ required: true }]}>
                                        <Input placeholder="Automatically generated" disabled />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                                        <Input placeholder="e.g. Ho Chi Minh, Vietnam" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="salary" label="Salary Range">
                                        <Input placeholder="e.g. $1000 - $2000" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="contactEmail" label="Contact Email" rules={[{ type: 'email' }]}>
                                <Input placeholder="hr@company.com" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="skills" label="Technical Skills (Tags)">
                                        <Select mode="tags" placeholder="e.g. React, Node.js" tokenSeparators={[',']} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="requirements" label="Other Requirements (Tags)">
                                        <Select mode="tags" placeholder="e.g. English, Teamwork" tokenSeparators={[',']} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Job Description"
                                rules={[{ required: true, message: "Description is required" }]}
                            >
                                <div ref={quillRef} style={{ height: 280, background: "#fff" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 24,
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: 16
                    }}>
                        <Button onClick={() => setIsModalVisible(false)} size="large">Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ background: '#4F46E5', borderColor: '#4F46E5' }}>
                            {editingJob ? "Update Job" : "Post Job"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </RecruiterLayout>
    );
};

export default RecruiterJobManagement;
