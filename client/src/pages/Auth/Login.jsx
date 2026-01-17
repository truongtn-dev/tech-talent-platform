import { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const { Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const data = await login(values);
            message.success("Welcome back!");

            // Redirect based on role
            if (data.user.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (data.user.role === "RECRUITER") {
                navigate("/recruiter/dashboard");
            } else if (data.user.role === "INTERVIEWER") {
                navigate("/interviewer/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.message || "Invalid email or password";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            {/* LEFT SIDE - Premium Brand Panel */}
            <div className="auth-left-panel">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        <div style={{
                            width: 32,
                            height: 32,
                            background: "#ED1B2F",
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span>Tech Talent</span>
                    </div>

                    <h1 className="auth-brand-heading">
                        Welcome Back. <br />
                        Ready for Success?
                    </h1>
                    <p className="auth-brand-text">
                        Access your dashboard, manage your applications, and discover new opportunities.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <div className="auth-title-row">
                        <h2 className="auth-title">Log In</h2>
                        <p className="auth-subtitle">
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        className="modern-auth-form"
                        size="large"
                    >
                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                { type: "email", message: "Please enter a valid email" },
                                { required: true, message: "Email is required" },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                                placeholder="name@company.com"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                { required: true, message: "Password is required" },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                                placeholder="Enter your password"
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: 16 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="submit-btn"
                            >
                                Log In
                            </Button>
                        </Form.Item>

                        <div className="auth-footer" style={{ textAlign: "center", marginTop: 24 }}>
                            <Text type="secondary">Don't have an account? </Text>
                            <Link to="/register" style={{ color: "#ED1B2F", fontWeight: 600 }}>
                                Sign Up
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Login;
