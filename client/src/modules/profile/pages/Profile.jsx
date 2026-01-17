import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Row, Col, Typography, message, Avatar, Upload, Divider, Tabs, Select } from "antd";
import { UserOutlined, PhoneOutlined, EnvironmentOutlined, CameraOutlined, EditOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import profileService from "../../../services/profileService";
import authService from "../../../services/authService";
import ChangePassword from "./ChangePassword";
import "../../../styles/auth.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [form] = Form.useForm();

    // Initialize form with user data
    useEffect(() => {
        if (user && user.profile) {
            form.setFieldsValue({
                firstName: user.profile.firstName || user.profile.fullName?.split(" ")[0],
                lastName: user.profile.lastName || user.profile.fullName?.split(" ").slice(1).join(" "),
                phone: user.profile.phone,
                location: user.profile.location,
                headline: user.profile.headline,
                headline: user.profile.headline,
                summary: user.profile.summary,
                skills: user.profile.skills || [],
            });
        }
    }, [user, form]);

    const onUpdateProfile = async (values) => {
        setLoading(true);
        try {
            // Ensure fullName is updated based on first/last name
            const profileData = {
                ...values,
                fullName: `${values.firstName} ${values.lastName}`.trim()
            };

            const updatedProfile = await profileService.updateProfile(profileData);
            message.success("Profile updated successfully!");

            const newUser = { ...user, profile: updatedProfile };
            localStorage.setItem("user", JSON.stringify(newUser));
            window.location.reload();
        } catch (error) {
            console.error("Update error:", error);
            message.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", paddingBottom: 40 }}>
            {/* Header Banner */}
            <div style={{ height: 200, background: "linear-gradient(135deg, #1f1f1f 0%, #ED1B2F 100%)", position: "relative" }}>
                <div className="container" style={{ position: "relative", height: "100%" }}>
                    <h1 style={{ color: "white", padding: "40px 0", margin: 0, fontWeight: 700 }}>My Profile</h1>
                </div>
            </div>

            <div className="container" style={{ marginTop: -80 }}>
                <Row gutter={[24, 24]}>
                    {/* Sidebar */}
                    <Col xs={24} md={8}>
                        <Card className="profile-card" bordered={false} bodyStyle={{ padding: 0 }}>
                            <div style={{ padding: 30, textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <Avatar
                                        size={120}
                                        src={user?.avatar}
                                        icon={<UserOutlined />}
                                        style={{ border: "4px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                                    />
                                    <Upload
                                        showUploadList={false}
                                        customRequest={async ({ file, onSuccess, onError }) => {
                                            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                                            if (!isJpgOrPng) {
                                                message.error('You can only upload JPG/PNG file!');
                                                onError('File type error');
                                                return;
                                            }
                                            const isLt2M = file.size / 1024 / 1024 < 2;
                                            if (!isLt2M) {
                                                message.error('Image must be smaller than 2MB!');
                                                onError('File size error');
                                                return;
                                            }

                                            setAvatarLoading(true);
                                            try {
                                                const formData = new FormData();
                                                formData.append("avatar", file);
                                                const response = await authService.updateAvatar(formData);

                                                message.success("Avatar updated!");
                                                const newUser = { ...user, avatar: response.avatar };
                                                localStorage.setItem("user", JSON.stringify(newUser));
                                                window.location.reload();
                                                onSuccess("ok");
                                            } catch (error) {
                                                console.error("Avatar upload error:", error);
                                                message.error("Failed to upload avatar");
                                                onError(error);
                                            } finally {
                                                setAvatarLoading(false);
                                            }
                                        }}
                                        accept="image/*"
                                    >
                                        <Button
                                            shape="circle"
                                            loading={avatarLoading}
                                            icon={<CameraOutlined />}
                                            size="small"
                                            style={{ position: "absolute", bottom: 0, right: 0, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                                        />
                                    </Upload>
                                </div>

                                <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                                    {user?.profile?.fullName || "User Name"}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 16, display: "block", marginBottom: 16 }}>
                                    {user?.profile?.headline || user?.email}
                                </Text>

                                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
                                    <Button type="primary" shape="round" style={{ backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}>Connect</Button>
                                    <Button shape="round">Message</Button>
                                </div>
                            </div>

                            <div style={{ padding: 24 }}>
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong><UserOutlined style={{ marginRight: 8, color: "#8c8c8c" }} /> Role</Text>
                                    <div style={{ float: "right", color: "#595959" }}>{user?.role}</div>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <Text strong><EnvironmentOutlined style={{ marginRight: 8, color: "#8c8c8c" }} /> Location</Text>
                                    <div style={{ float: "right", color: "#595959" }}>{user?.profile?.location || "N/A"}</div>
                                </div>
                                <div>
                                    <Text strong><PhoneOutlined style={{ marginRight: 8, color: "#8c8c8c" }} /> Phone</Text>
                                    <div style={{ float: "right", color: "#595959" }}>{user?.profile?.phone || "N/A"}</div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Main Content */}
                    <Col xs={24} md={16}>
                        <Card bordered={false} className="profile-content-card">
                            <Tabs defaultActiveKey="1" size="large">
                                <TabPane tab={<span><EditOutlined /> Edit Profile</span>} key="1">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onUpdateProfile}
                                        style={{ marginTop: 24 }}
                                        requiredMark={false}
                                    >
                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="firstName"
                                                    label="First Name"
                                                    rules={[{ required: true, message: "Required" }]}
                                                >
                                                    <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="lastName"
                                                    label="Last Name"
                                                    rules={[{ required: true, message: "Required" }]}
                                                >
                                                    <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={24}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item
                                                    name="phone"
                                                    label="Phone Number"
                                                >
                                                    <Input size="large" prefix={<PhoneOutlined className="site-form-item-icon" />} />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item
                                            name="headline"
                                            label="Professional Headline"
                                            tooltip="A brief description that appears below your name"
                                        >
                                            <Input size="large" placeholder="e.g. Senior Frontend Developer at TechCorp" />
                                        </Form.Item>

                                        <Form.Item
                                            name="location"
                                            label="Location"
                                        >
                                            <Input size="large" prefix={<EnvironmentOutlined />} placeholder="City, Country" />
                                        </Form.Item>

                                        <Form.Item
                                            name="summary"
                                            label="About Me"
                                        >
                                            <TextArea
                                                rows={6}
                                                placeholder="Tell potential employers or candidates about your background, skills, and goals..."
                                                maxLength={500}
                                                showCount
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="skills"
                                            label="Skills"
                                            tooltip="Select or type your key skills"
                                        >
                                            <Select
                                                mode="tags"
                                                style={{ width: '100%' }}
                                                placeholder="e.g. React, Node.js, Python"
                                                tokenSeparators={[',']}
                                                size="large"
                                            />
                                        </Form.Item>

                                        <Divider />

                                        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                                            <Button type="default" style={{ marginRight: 12 }} onClick={() => form.resetFields()}>
                                                Reset
                                            </Button>
                                            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ minWidth: 120, backgroundColor: "#ED1B2F", borderColor: "#ED1B2F" }}>
                                                Save Changes
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </TabPane>
                                <TabPane tab="Change Password" key="2">
                                    <ChangePassword />
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>

            <style>{`
        .profile-card, .profile-content-card {
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            overflow: hidden;
        }
        .ant-tabs-nav::before {
            border-bottom: 1px solid #f0f0f0;
        }
        .ant-btn-primary:hover {
            opacity: 0.9;
        }
        /* Tabs Branding */
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #ED1B2F !important;
        }
        .ant-tabs-tab:hover {
            color: #ED1B2F !important;
        }
        .ant-tabs-ink-bar {
            background: #ED1B2F !important;
        }
      `}</style>
        </div>
    );
};

export default Profile;
