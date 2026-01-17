import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import authService from "../../../services/authService";

const ChangePassword = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            message.success("Password changed successfully!");
            form.resetFields();
        } catch (error) {
            console.error("Change password error:", error);
            message.error(error.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: "24px auto" }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                size="large"
            >
                <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[
                        { required: true, message: "Please enter your current password" },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Enter current password"
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                        { required: true, message: "Please enter new password" },
                        { min: 6, message: "Password must be at least 6 characters" },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Enter new password"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: "Please confirm your new password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Passwords do not match"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                        placeholder="Confirm new password"
                    />
                </Form.Item>

                <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{
                            backgroundColor: "#ED1B2F",
                            borderColor: "#ED1B2F",
                            height: 44
                        }}
                    >
                        Change Password
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePassword;
