import { useState, useEffect } from "react";
import {
  Table, Tag, Space, Button, Typography, message,
  Modal, Form, Input, Select, Tooltip, Row, Col, Popconfirm, DatePicker, Avatar
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  ProjectOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StopOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import ImageUpload from "../../../components/common/ImageUpload";
import "../../../styles/admin.css";

// ✅ React 19–safe editor
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const { Title } = Typography;

const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [challenges, setChallenges] = useState([]);

  const [form] = Form.useForm();

  // =========================
  // Quill Editor (SAFE)
  // =========================
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

  // Sync editor → AntD Form
  useEffect(() => {
    if (!quill) return;

    quill.on("text-change", () => {
      form.setFieldValue("description", quill.root.innerHTML);
    });
  }, [quill, form]);

  // =========================
  // Data Fetching
  // =========================
  useEffect(() => {
    fetchJobs();
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const data = await adminService.getChallenges();
      setChallenges(data);
    } catch (err) {
      console.error("Failed to load challenges");
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllJobs();
      setJobs(data);
    } catch {
      message.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveJob(id);
      message.success("Job approved and published");
      fetchJobs();
    } catch {
      message.error("Failed to approve job");
    }
  };

  const handleHide = async (id) => {
    try {
      await adminService.hideJob(id);
      message.success("Job hidden/closed");
      fetchJobs();
    } catch {
      message.error("Failed to hide job");
    }
  };

  // =========================
  // CRUD Handlers
  // =========================
  const handleFormSubmit = async (values) => {
    setLoading(true);
    // Format date to ISO string
    const submissionData = {
      ...values,
      applicationDeadline: values.applicationDeadline ? values.applicationDeadline.toISOString() : null
    };

    try {
      if (editingJob) {
        await adminService.updateJob(editingJob._id, submissionData);
        message.success("Job updated successfully");
      } else {
        await adminService.createJob(submissionData);
        message.success("Job created successfully");
      }
      setIsModalVisible(false);
      setEditingJob(null);
      form.resetFields();
      if (quill) quill.root.innerHTML = "";
      fetchJobs();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteJob(id);
      message.success("Job deleted successfully");
      fetchJobs();
    } catch {
      message.error("Delete failed");
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    form.setFieldsValue({
      ...job,
      applicationDeadline: job.applicationDeadline
        ? dayjs(job.applicationDeadline)
        : null,
    });

    if (quill && job.description) {
      quill.root.innerHTML = job.description;
    } else if (quill) {
      quill.root.innerHTML = "";
    }

    setIsModalVisible(true);
  };

  // =========================
  // Helpers
  // =========================
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

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(searchText.toLowerCase()),
  );

  // =========================
  // Table Columns
  // =========================
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
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.type}</Tag>
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
      title: "Technical Test",
      dataIndex: "challengeId",
      render: (chal) => chal ? <Tag color="cyan">Attached</Tag> : <Text type="secondary">None</Text>,
    },
    {
      title: "Posted Date",
      dataIndex: "createdAt",
      render: (date) => dayjs(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <Tooltip title="Approve">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                className="admin-action-btn"
                onClick={() => handleApprove(record._id)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              />
            </Tooltip>
          )}
          {(record.status === "PUBLISHED" || record.status === "PENDING") && (
            <Tooltip title="Hide/Close">
              <Button
                danger
                icon={<StopOutlined />}
                size="small"
                className="admin-action-btn"
                onClick={() => handleHide(record._id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              className="admin-action-btn"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete job?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button danger icon={<DeleteOutlined />} size="small" className="admin-action-btn" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =========================
  // Render
  // =========================
  return (
    <AdminLayout>
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
          <ProjectOutlined style={{ marginRight: 10, fontSize: '20px', color: '#ED1B2F' }} />
          Job Management
        </Title>
        <Space size="small">
          <Input
            className="custom-search-input"
            prefix={<SearchOutlined style={{ fontSize: 16 }} />}
            placeholder="Search by title or company"
            style={{
              width: 280,
              borderRadius: 6,
              fontSize: '13px'
            }}
            onChange={(e) => setSearchText(e.target.value)}
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
              background: '#ED1B2F',
              borderColor: '#ED1B2F',
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
        className="admin-table"
        rowKey="_id"
        columns={columns}
        dataSource={filteredJobs}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        bordered={false}
        style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
      />

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
            status: "PUBLISHED",
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
                  Upload Job Thumbnail
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
                  <Select.Option value="PUBLISHED">Published</Select.Option>
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

              <Form.Item name="challengeId" label="Technical Challenge">
                <Select placeholder="Select a coding challenge (Optional)" allowClear>
                  {challenges.map(c => (
                    <Select.Option key={c._id} value={c._id}>
                      {c.title} ({c.difficulty})
                    </Select.Option>
                  ))}
                </Select>
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
            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}>
              {editingJob ? "Update Job" : "Post Job"}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default JobManagement;
