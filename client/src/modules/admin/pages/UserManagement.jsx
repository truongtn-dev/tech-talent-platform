import { useState, useEffect } from "react";
import {
    Table, Tag, Space, Button, Typography, message,
    Modal, Form, Input, Select, Tooltip, Card
} from "antd";
import {
    EditOutlined,
    StopOutlined,
    CheckCircleOutlined,
    UserAddOutlined,
    SearchOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

const { Title, Text } = Typography;

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

    const handleFormSubmit = async (values) => {
        try {
            if (editingUser) {
                await adminService.updateUser(editingUser._id, values);
                message.success("User updated");
            } else {
                await adminService.createUser(values);
                message.success("User created");
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
            title: 'User Identity',
            key: 'identity',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {record.firstName} {record.lastName}
                    </div>
                </div>
            )
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="blue">{role}</Tag>
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
                        />
                    </Tooltip>
                    <Tooltip title={record.status === "ACTIVE" ? "Suspend" : "Activate"}>
                        <Button
                            danger={record.status === "ACTIVE"}
                            type={record.status !== "ACTIVE" ? "primary" : "default"}
                            icon={record.status === "ACTIVE" ? <StopOutlined /> : <CheckCircleOutlined />}
                            onClick={() => handleToggleUser(record._id)}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <AdminLayout title="Manage Users">
            <Card className="admin-card">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search users..."
                        style={{ width: 300, borderRadius: 8 }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                        style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}
                    >
                        Add User
                    </Button>
                </div>
                <Table
                    className="admin-table"
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={editingUser ? "Edit User" : "Create User"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input disabled={!!editingUser} />
                    </Form.Item>
                    {!editingUser && (
                        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Space style={{ display: 'flex', marginBottom: 16 }} align="baseline">
                        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Space>
                    <Form.Item name="role" label="Role" initialValue="CANDIDATE">
                        <Select>
                            <Select.Option value="ADMIN">Admin</Select.Option>
                            <Select.Option value="RECRUITER">Recruiter</Select.Option>
                            <Select.Option value="INTERVIEWER">Interviewer</Select.Option>
                            <Select.Option value="CANDIDATE">Candidate</Select.Option>
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" style={{ background: '#ED1B2F', borderColor: '#ED1B2F' }}>
                            {editingUser ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default UserManagement;
