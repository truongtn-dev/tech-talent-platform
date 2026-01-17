import { useState, useEffect } from "react";
import {
    Table, Tag, Space, Button, Typography, message,
    Modal, Form, Input, Select, Tooltip, Row, Col, Avatar, Popconfirm
} from "antd";
import {
    EditOutlined,
    StopOutlined,
    CheckCircleOutlined,
    UserAddOutlined,
    SearchOutlined,
    TeamOutlined,
    UserOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";
import ImageUpload from "../../../components/common/ImageUpload";

const { Title } = Typography;

const UserManagement = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data.users || data);
        } catch (error) {
            message.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (userId) => {
        try {
            await adminService.toggleUserStatus(userId);
            message.success("User status updated");
            fetchUsers();
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await adminService.deleteUser(userId);
            message.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            message.error(error.message || "Failed to delete user");
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            if (editingUser) {
                await adminService.updateUser(editingUser._id, values);
                message.success("User updated successfully");
            } else {
                await adminService.createUser(values);
                message.success("User created successfully");
            }
            setIsModalVisible(false);
            setEditingUser(null);
            form.resetFields();
            fetchUsers();
        } catch (error) {
            message.error("Operation failed");
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setIsModalVisible(true);
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'No.',
            key: 'index',
            width: 60,
            align: 'center',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'User Identity',
            key: 'identity',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.avatar} icon={<UserOutlined />} size="large" />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {record.firstName || record.lastName ? `${record.firstName || ""} ${record.lastName || ""}` : "No Name"}
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'default';
                if (role === 'ADMIN') color = 'red';
                if (role === 'RECRUITER') color = 'blue';
                if (role === 'CANDIDATE') color = 'green';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Job / Professional',
            key: 'professional',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.headline || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{record.location || 'Unknown Location'}</div>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === "ACTIVE" ? "success" : "error"}>
                    {status || "ACTIVE"}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            size="small"
                            className="admin-action-btn"
                        />
                    </Tooltip>
                    <Tooltip title={record.status === "ACTIVE" ? "Suspend" : "Activate"}>
                        <Button
                            danger={record.status === "ACTIVE"}
                            type={record.status !== "ACTIVE" ? "primary" : "default"}
                            icon={record.status === "ACTIVE" ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleUser(record._id)}
                            size="small"
                            className="admin-action-btn"
                            disabled={record.role === 'ADMIN'}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete User"
                        description="Are you sure you want to delete this user? This action cannot be undone."
                        onConfirm={() => handleDeleteUser(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
                        disabled={record.role === 'ADMIN'}
                    >
                        <Tooltip title="Delete">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                className="admin-action-btn"
                                disabled={record.role === 'ADMIN'}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

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
                    <TeamOutlined style={{ marginRight: 10, fontSize: '20px', color: '#ED1B2F' }} />
                    User Management
                </Title>
                <Space size="small">
                    <Input
                        className="custom-search-input"
                        prefix={<SearchOutlined style={{ fontSize: 16 }} />}
                        placeholder="Search users..."
                        style={{
                            width: 280,
                            borderRadius: 6,
                            fontSize: '13px'
                        }}
                        onChange={e => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            form.resetFields();
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
                        Add User
                    </Button>
                </Space>
            </div>

            <Table
                className="admin-table"
                columns={columns}
                dataSource={filteredUsers}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                bordered={false}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}
            />

            <Modal
                title={editingUser ? "Edit User Profile" : "Create New User"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                centered
                maskClosable={false}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Row gutter={24}>
                        {/* Left Column: Avatar & Basic Identity */}
                        <Col span={8} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                            <div style={{ marginBottom: 16 }}>
                                <Form.Item name="avatar" noStyle>
                                    <ImageUpload />
                                </Form.Item>
                                <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                                    Upload User Avatar
                                </div>
                            </div>

                            <Form.Item
                                name="role"
                                label="User Role"
                                initialValue="CANDIDATE"
                            >
                                <Select style={{ width: '100%' }}>
                                    <Select.Option value="CANDIDATE">Candidate</Select.Option>
                                    <Select.Option value="RECRUITER">Recruiter</Select.Option>
                                    <Select.Option value="INTERVIEWER">Interviewer</Select.Option>
                                    <Select.Option value="ADMIN">Administrator</Select.Option>
                                </Select>
                            </Form.Item>

                            {!editingUser && (
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true, min: 6, message: 'Min 6 chars' }]}
                                >
                                    <Input.Password placeholder="Set password" />
                                </Form.Item>
                            )}
                        </Col>

                        {/* Right Column: Detailed Info */}
                        <Col span={16}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                        <Input placeholder="John" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                        <Input placeholder="Doe" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                        <Input disabled={!!editingUser} placeholder="user@example.com" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="phone" label="Phone">
                                        <Input placeholder="+1 234 567 890" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="headline" label="Job Title / Headline">
                                        <Input placeholder="e.g. Senior Developer" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="location" label="Location">
                                        <Input placeholder="City, Country" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="bio" label="Bio / Summary">
                                <Input.TextArea rows={3} placeholder="Brief professional summary" />
                            </Form.Item>

                            <Form.Item name="skills" label="Skills">
                                <Select mode="tags" placeholder="Add skills (e.g. React, Node.js)" tokenSeparators={[',']} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                        <Button onClick={() => setIsModalVisible(false)} size="large">Cancel</Button>
                        <Button type="primary" htmlType="submit" size="large" style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}>
                            {editingUser ? "Save Changes" : "Create User"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default UserManagement;
