import { useState, useEffect } from "react";
import { Form, Input, Button, Select, Upload, message, Card, Typography, InputNumber, DatePicker } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import jobService from "../api";
import dayjs from "dayjs";

const { Title } = Typography;
const { TextArea } = Input;

const JobForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const data = await jobService.getJobById(id);
            const job = data.job || data;

            form.setFieldsValue({
                ...job,
                applicationDeadline: job.applicationDeadline ? dayjs(job.applicationDeadline) : null,
            });

            if (job.thumbnail) {
                setFileList([{
                    uid: '-1',
                    name: 'thumbnail.jpg',
                    status: 'done',
                    url: job.thumbnail,
                }]);
            }
        } catch (error) {
            message.error("Failed to load job");
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append all form fields
            Object.keys(values).forEach(key => {
                if (key === 'skills' || key === 'requirements') {
                    formData.append(key, JSON.stringify(values[key] || []));
                } else if (key === 'applicationDeadline' && values[key]) {
                    formData.append(key, values[key].toISOString());
                } else if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });

            // Append thumbnail if new file uploaded
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("thumbnail", fileList[0].originFileObj);
            }

            if (isEdit) {
                await jobService.updateJob(id, formData);
                message.success("Job updated successfully!");
            } else {
                await jobService.createJob(formData);
                message.success("Job created successfully!");
            }

            navigate("/jobs/manage");
        } catch (error) {
            console.error("Job submit error:", error);
            message.error(error.message || "Failed to save job");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1)); // Keep only last file
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Thumbnail</div>
        </div>
    );

    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
                <Card style={{ borderRadius: 12 }}>
                    <Title level={2} style={{ marginBottom: 32 }}>
                        {isEdit ? "Edit Job" : "Create New Job"}
                    </Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        size="large"
                        initialValues={{
                            type: "FULL_TIME",
                            level: "MID",
                            status: "DRAFT"
                        }}
                    >
                        <Form.Item
                            name="thumbnail"
                            label="Job Thumbnail"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e && e.fileList;
                            }}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleUploadChange}
                                beforeUpload={() => false}
                                accept="image/*"
                                maxCount={1}
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label="Job Title"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input placeholder="e.g. Senior React Developer" />
                        </Form.Item>

                        <Form.Item
                            name="company"
                            label="Company Name"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input placeholder="e.g. TechCorp Inc." />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Job Description"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                            />
                        </Form.Item>

                        <Form.Item
                            name="requirements"
                            label="Requirements"
                            tooltip="Enter each requirement separately"
                        >
                            <Select
                                mode="tags"
                                placeholder="Type and press Enter to add requirements"
                                tokenSeparators={[',']}
                            />
                        </Form.Item>

                        <Form.Item
                            name="skills"
                            label="Required Skills"
                            tooltip="Enter each skill separately"
                        >
                            <Select
                                mode="tags"
                                placeholder="e.g. React, Node.js, TypeScript"
                                tokenSeparators={[',']}
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="type"
                                label="Job Type"
                                style={{ flex: 1 }}
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Select.Option value="FULL_TIME">Full Time</Select.Option>
                                    <Select.Option value="PART_TIME">Part Time</Select.Option>
                                    <Select.Option value="CONTRACT">Contract</Select.Option>
                                    <Select.Option value="INTERNSHIP">Internship</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="level"
                                label="Experience Level"
                                style={{ flex: 1 }}
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Select.Option value="JUNIOR">Junior</Select.Option>
                                    <Select.Option value="MID">Mid-Level</Select.Option>
                                    <Select.Option value="SENIOR">Senior</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="location"
                                label="Location"
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="e.g. San Francisco, CA or Remote" />
                            </Form.Item>

                            <Form.Item
                                name="salary"
                                label="Salary Range"
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="e.g. $80,000 - $120,000" />
                            </Form.Item>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                name="contactEmail"
                                label="Contact Email"
                                style={{ flex: 1 }}
                                rules={[{ type: 'email', message: 'Invalid email' }]}
                            >
                                <Input placeholder="hr@company.com" />
                            </Form.Item>

                            <Form.Item
                                name="applicationDeadline"
                                label="Application Deadline"
                                style={{ flex: 1 }}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Select.Option value="DRAFT">Draft</Select.Option>
                                <Select.Option value="PUBLISHED">Published</Select.Option>
                                <Select.Option value="CLOSED">Closed</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, marginTop: 32 }}>
                            <Button
                                type="default"
                                onClick={() => navigate("/jobs/manage")}
                                style={{ marginRight: 12 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}
                            >
                                {isEdit ? "Update Job" : "Create Job"}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default JobForm;
