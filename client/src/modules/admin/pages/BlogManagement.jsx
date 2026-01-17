import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import ImageUpload from "../../../components/common/ImageUpload";
import "../../../styles/admin.css";

const { Text } = Typography;

const BlogManagement = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const [form] = Form.useForm();

  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    },
    placeholder: "Write blog content here...",
  });

  useEffect(() => {
    if (!quill) return;

    if (editingBlog && isModalVisible) {
      quill.clipboard.dangerouslyPasteHTML(editingBlog.content);
    }

    quill.on("text-change", () => {
      form.setFieldValue("content", quill.root.innerHTML);
    });
  }, [quill, isModalVisible, editingBlog, form]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getBlogs();
      setBlogs(res);
    } catch {
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
    } catch {
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
      if (quill) quill.root.innerHTML = "";
      fetchBlogs();
    } catch {
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    form.setFieldsValue({
      title: blog.title,
      slug: blog.slug,
      status: blog.status,
      thumbnail: blog.thumbnail,
      content: blog.content,
    });

    if (quill && blog.content) {
      quill.root.innerHTML = blog.content;
    }

    setIsModalVisible(true);
  };

  const handleTitleChange = (e) => {
    if (editingBlog) return;

    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s-]+/g, "-");

    form.setFieldsValue({ slug });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      render: (slug) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {slug}
        </Text>
      ),
    },
    {
      title: "Author",
      render: (_, record) => record.author?.email || "Unknown",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "PUBLISHED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [searchText, setSearchText] = useState("");

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
    blog.slug.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header Card */}
      <div style={{
        marginBottom: 16,
        padding: '10px 24px',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        border: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FileTextOutlined style={{ fontSize: 20, color: '#ED1B2F', marginRight: 12, padding: 8, background: '#FFF1F0', borderRadius: 8 }} />
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1f2937' }}>Manage Blogs</h2>
          </div>
        </div>

        <Space size="middle">
          <Input
            className="custom-search-input"
            prefix={<SearchOutlined style={{ color: '#fff' }} />}
            placeholder="Search blogs..."
            style={{ width: 280 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchBlogs} style={{ borderRadius: 8 }}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBlog(null);
              form.resetFields();
              if (quill) quill.root.innerHTML = "";
              setIsModalVisible(true);
            }}
            style={{
              background: "#ED1B2F",
              borderColor: "#ED1B2F",
              borderRadius: 8,
              fontWeight: 600
            }}
          >
            Create Blog
          </Button>
        </Space>
      </div>

      <Table
        className="admin-table"
        rowKey="_id"
        columns={columns}
        dataSource={filteredBlogs}
        loading={loading}
        pagination={{ pageSize: 8 }}
        style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
      />

      <style>{`
          .custom-search-input.ant-input-affix-wrapper {
              padding: 0 !important;
              height: 40px !important;
              display: flex !important;
              align-items: center !important;
              border-radius: 8px !important;
              border: 1px solid #e5e7eb !important;
              overflow: hidden !important;
          }
          .custom-search-input .ant-input-prefix {
              margin: 0 !important;
              width: 40px !important;
              height: 100% !important;
              background: #ED1B2F; /* Admin Red */
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
          }
          .custom-search-input .ant-input {
              height: 100% !important;
              padding: 0 12px !important;
          }
          .custom-search-input.ant-input-affix-wrapper:hover,
          .custom-search-input.ant-input-affix-wrapper:focus,
          .custom-search-input.ant-input-affix-wrapper-focused {
              border-color: #ED1B2F !important;
              box-shadow: 0 0 0 2px rgba(237, 27, 47, 0.1) !important;
          }
      `}</style>

      <Modal
        title={editingBlog ? "Edit Blog" : "Create New Blog"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        maskClosable={false}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: "DRAFT" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please enter a title",
              },
            ]}
          >
            <Input placeholder="Blog title" onChange={handleTitleChange} />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[
              {
                required: true,
                message: "Slug is required",
              },
            ]}
          >
            <Input placeholder="friendly-url-slug" />
          </Form.Item>

          <Form.Item name="thumbnail" label="Thumbnail">
            <ImageUpload />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="DRAFT">Draft</Select.Option>
              <Select.Option value="PUBLISHED">Published</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[
              {
                required: true,
                message: "Please enter content",
              },
            ]}
          >
            <div
              ref={quillRef}
              style={{
                height: 300,
                background: "#fff",
                marginBottom: 40,
              }}
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                background: "#ED1B2F",
                borderColor: "#ED1B2F",
              }}
              loading={loading}
            >
              {editingBlog ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default BlogManagement;
