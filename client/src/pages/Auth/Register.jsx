import { useState } from "react";
import { Form, Input, Button, Radio, message, Typography, Upload } from "antd";
import { LockOutlined, MailOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const { Text } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { register } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("firstName", values.firstName);
            formData.append("lastName", values.lastName);
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("role", values.role);

            if (fileList.length > 0) {
                formData.append("avatar", fileList[0].originFileObj);
            }

            console.log("Registering user....");
            await register(formData);

            message.success("Registration successful! Welcome!");
            navigate("/");
        } catch (error) {
            console.error("Registration error:", error);
            const errorMsg = error.message || "Registration failed. Please try again.";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload Avatar</div>
        </div>
    );

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
                        Discover Your <br />
                        Next Career Move.
                    </h1>
                    <p className="auth-brand-text">
                        Join thousands of professionals and companies building the future together.
                        The most premium platform for elite tech talent.
                    </p>
                </div>

                <div className="auth-testimonial">
                    <p className="auth-testimonial-text">
                        "Tech Talent Platform completely transformed our hiring process.
                        We found exceptional candidates in record time."
                    </p>
                    <div className="auth-testimonial-author">
                        <div className="auth-testimonial-avatar">JD</div>
                        <div>
                            <div style={{ color: "white", fontWeight: 600 }}>Jane Doe</div>
                            <div style={{ color: "#aaa", fontSize: 13 }}>CTO at TechCorp</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className="auth-right-panel">
                <div className="auth-form-container">
                    <div className="auth-title-row">
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-subtitle">
                            Start your journey with us today.
                        </p>
                    </div>

                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        layout="vertical"
                        className="modern-auth-form"
                        initialValues={{ role: "CANDIDATE" }}
                        size="large"
                    >
                        <Form.Item name="role" style={{ marginBottom: 32 }}>
                            <Radio.Group className="role-selector-group">
                                <Radio.Button value="CANDIDATE">Candidate</Radio.Button>
                                <Radio.Button value="RECRUITER">Recruiter</Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="avatar"
                            label="Profile Picture"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) return e;
                                return e && e.fileList;
                            }}
                            style={{ textAlign: 'center' }}
                        >
                            <Upload
                                name="avatar"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={true}
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={handleUploadChange}
                                accept="image/*"
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true, message: "Required" }]}
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="John" />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true, message: "Required" }]}
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="Doe" />
                            </Form.Item>
                        </div>

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
                                { min: 6, message: "At least 6 characters" },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                                placeholder="Create a strong password"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Confirm Password"
                            name="confirm"
                            dependencies={["password"]}
                            rules={[
                                { required: true, message: "Please confirm your password" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Passwords do not match"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                                placeholder="Repeat your password"
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
                                Sign Up
                            </Button>
                        </Form.Item>

                        <div className="auth-footer" style={{ textAlign: "center", marginTop: 24 }}>
                            <Text type="secondary">Already have an account? </Text>
                            <Link to="/login" style={{ color: "#ED1B2F", fontWeight: 600 }}>
                                Log in
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default Register;
