import { useState, useEffect } from "react";
import {
    Table, Tag, Space, Button, Typography, message,
    Modal, Form, Input, Select, Tooltip, Row, Col, Popconfirm, Card
} from "antd";
import {
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    CodeOutlined,
    DeleteOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import adminService from "../api";
import AdminLayout from "../components/AdminLayout";
import "../../../styles/admin.css";

// React Quill for Description
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChallengeManagement = () => {
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    // Editor
    const { quill, quillRef } = useQuill({
        theme: "snow",
        placeholder: "Describe the challenge...",
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "code-block"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["clean"]
            ]
        }
    });

    useEffect(() => {
        if (!quill) return;
        quill.on("text-change", () => {
            form.setFieldValue("description", quill.root.innerHTML);
        });
    }, [quill, form]);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const data = await adminService.getChallenges();
            setChallenges(data);
        } catch (error) {
            message.error("Failed to load challenges");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {
        setLoading(true);
        try {
            // Process test cases if they are just a string, simpler to use JSON or specialized input
            // For now, let's assume valid JSON or simple format.
            // Actually, let's just make test cases a JSON text area for MVP flexibility
            let processedValues = { ...values };

            // Ensure description is from quill
            const description = quill ? quill.root.innerHTML : values.description;
            processedValues.description = description;

            if (editingChallenge) {
                await adminService.updateChallenge(editingChallenge._id, processedValues);
                message.success("Challenge updated");
            } else {
                await adminService.createChallenge(processedValues);
                message.success("Challenge created");
            }
            setIsModalVisible(false);
            setEditingChallenge(null);
            form.resetFields();
            if (quill) quill.root.innerHTML = "";
            fetchChallenges();
        } catch (error) {
            message.error(error.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteChallenge(id);
            message.success("Challenge deleted");
            fetchChallenges();
        } catch (error) {
            message.error("Failed to delete challenge");
        }
    };

    const openEditModal = (challenge) => {
        setEditingChallenge(challenge);
        form.setFieldsValue({
            ...challenge,
            // If testCases is array, we might want to let user edit it as JSON or manage list
            // For simplicity, let's not implement complex test case editor here yet, or just basic fields
        });
        if (quill) quill.root.innerHTML = challenge.description || "";
        setIsModalVisible(true);
    };

    const filteredChallenges = challenges.filter(c =>
        c.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: "Difficulty",
            dataIndex: "difficulty",
            key: "difficulty",
            render: (diff) => {
                const colors = { EASY: "green", MEDIUM: "orange", HARD: "red" };
                return <Tag color={colors[diff] || "default"}>{diff}</Tag>;
            }
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} size="small" />
                    </Tooltip>
                    <Popconfirm title="Delete?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger size="small" />
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
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                    <CodeOutlined style={{ marginRight: 10, color: '#ED1B2F' }} />
                    Challenge Management
                </Title>
                <Space>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Search challenges"
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingChallenge(null);
                        form.resetFields();
                        if (quill) quill.root.innerHTML = "";
                        setIsModalVisible(true);
                    }}>
                        Add Challenge
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredChallenges}
                rowKey="_id"
                loading={loading}
                style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}
            />

            <Modal
                title={editingChallenge ? "Edit Challenge" : "Create Challenge"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                centered
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                                <Input placeholder="e.g. Reverse Linked List" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="EASY">Easy</Select.Option>
                                    <Select.Option value="MEDIUM">Medium</Select.Option>
                                    <Select.Option value="HARD">Hard</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <div ref={quillRef} style={{ height: 200, marginBottom: 50 }} />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="baseScore" label="Base Score" rules={[{ required: true }]}>
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="timeLimit" label="Time Limit (ms)" initialValue={1000}>
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={5} style={{ marginTop: 16 }}>Test Cases</Title>
                    <Form.List name="testCases">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'input']}
                                            rules={[{ required: true, message: 'Input required' }]}
                                        >
                                            <Input placeholder="Input (e.g., [1,2,3])" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'expectedOutput']}
                                            rules={[{ required: true, message: 'Output required' }]}
                                        >
                                            <Input placeholder="Output (e.g., [3,2,1])" />
                                        </Form.Item>
                                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Test Case
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                        <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">Save</Button>
                    </div>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default ChallengeManagement;
