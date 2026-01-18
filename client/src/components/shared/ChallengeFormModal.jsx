import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, Button, Space, message, InputNumber, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

const { TextArea } = Input;
const { Option } = Select;

const ChallengeFormModal = ({ visible, onCancel, onSuccess, editingChallenge = null, isAdmin = false }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { quill, quillRef } = useQuill();

    useEffect(() => {
        if (quill && visible && editingChallenge) {
            quill.root.innerHTML = editingChallenge.description || '';
        } else if (quill && !visible) {
            quill.root.innerHTML = '';
        }
    }, [quill, visible, editingChallenge]);

    useEffect(() => {
        if (visible && editingChallenge) {
            form.setFieldsValue({
                title: editingChallenge.title,
                difficulty: editingChallenge.difficulty,
                testCases: editingChallenge.testCases || [{ input: '', expectedOutput: '' }],
                timeLimit: editingChallenge.timeLimit || 1000,
                memoryLimit: editingChallenge.memoryLimit || 64,
                baseScore: editingChallenge.baseScore || 100,
                isPublic: editingChallenge.isPublic || false,
            });
        } else if (!visible) {
            form.resetFields();
        }
    }, [visible, editingChallenge, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const description = quill?.root.innerHTML || '<p>No description provided</p>';
            const processedValues = {
                ...values,
                description,
                languageTemplates: {
                    javascript: values.jsTemplate || "function solution(input) {\n  // write code here\n}"
                }
            };

            await onSuccess(processedValues, editingChallenge?._id);
            form.resetFields();
            if (quill) quill.root.innerHTML = '';
        } catch (error) {
            console.error('Form validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    {editingChallenge ? 'Update' : 'Create'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Challenge Title"
                    rules={[{ required: true, message: 'Please enter challenge title' }]}
                >
                    <Input placeholder="e.g., Two Sum, Reverse String" />
                </Form.Item>

                <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
                    <Select placeholder="Select difficulty">
                        <Option value="EASY">Easy</Option>
                        <Option value="MEDIUM">Medium</Option>
                        <Option value="HARD">Hard</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Description">
                    <div ref={quillRef} style={{ height: 200, marginBottom: 48 }} />
                </Form.Item>

                {isAdmin && (
                    <Form.Item name="isPublic" valuePropName="checked">
                        <Checkbox>Make this challenge public (visible to all recruiters)</Checkbox>
                    </Form.Item>
                )}

                <Form.Item label="Test Cases">
                    <Form.List name="testCases" initialValue={[{ input: '', expectedOutput: '' }]}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'input']}
                                            rules={[{ required: true, message: 'Missing input' }]}
                                            style={{ width: 300 }}
                                        >
                                            <Input placeholder={`Input (e.g., nums = [2,7], target = 9)`} />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'expectedOutput']}
                                            rules={[{ required: true, message: 'Missing output' }]}
                                            style={{ width: 200 }}
                                        >
                                            <Input placeholder="Expected (e.g., [0,1])" />
                                        </Form.Item>
                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                            />
                                        )}
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Test Case
                                </Button>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Space style={{ width: '100%' }}>
                    <Form.Item name="timeLimit" label="Time Limit (ms)" initialValue={1000}>
                        <InputNumber min={100} max={10000} style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name="memoryLimit" label="Memory (MB)" initialValue={64}>
                        <InputNumber min={8} max={512} style={{ width: 150 }} />
                    </Form.Item>
                    <Form.Item name="baseScore" label="Base Score" initialValue={100}>
                        <InputNumber min={10} max={200} style={{ width: 150 }} />
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );
};

export default ChallengeFormModal;
