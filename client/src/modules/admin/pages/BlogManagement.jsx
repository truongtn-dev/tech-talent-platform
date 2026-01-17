import { useState, useEffect } from "react";
import {
    Table, Tag, Button, Space, Typography, message,
    Modal, Form, Input, Select, Popconfirm, Card
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

const { Text } = Typography;
const { TextArea } = Input;

const BlogManagement = () => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await adminService.getBlogs();
            setBlogs(res);
        } catch (error) {
            message.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteBlog(id);
            message.success("Blog deleted successfully");
            fetchBlogs();
        } catch (error) {
            message.error("Delete failed");
        }
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingBlog) {
                await adminService.updateBlog(editingBlog._id, values);
                message.success("Blog updated successfully");
            } else {
                await adminService.createBlog(values);
                message.success("Blog created successfully");
            }
            setIsModalVisible(false);
            setEditingBlog(null);
            form.resetFields();
            fetchBlogs();
        } catch (error) {
            message.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (blog) => {
        setEditingBlog(blog);
        form.setFieldsValue({
            title: blog.title,
            content: blog.content,
            status: blog.status,
            thumbnail: blog.thumbnail
        });
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Author',
            key: 'author',
            render: (_, record) => record.author?.email || 'Unknown',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        size="small"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete this blog?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
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
        <AdminLayout title="Manage Blogs">
            <Card className="admin-card" bordered={false}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchBlogs}>Refresh</Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingBlog(null);
                                form.resetFields();
                                setIsModalVisible(true);
                            }}
                            style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}
                        >
                            Create New Blog
                        </Button>
                    </Space>
                </div>
                <Table
                    className="admin-table"
                    columns={columns}
                    dataSource={blogs}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={editingBlog ? "Edit Blog" : "Create New Blog"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Blog title" />
                    </Form.Item>

                    <Form.Item
                        name="thumbnail"
                        label="Thumbnail URL"
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        initialValue="DRAFT"
                    >
                        <Select>
                            <Select.Option value="DRAFT">Draft</Select.Option>
                            <Select.Option value="PUBLISHED">Published</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Content (Markdown)"
                        rules={[{ required: true, message: 'Please enter content' }]}
                    >
                        <TextArea rows={10} placeholder="Write your blog content here..." />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}>
                                {editingBlog ? "Update" : "Create"}
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default BlogManagement;
