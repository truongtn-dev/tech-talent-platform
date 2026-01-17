import React, { useState } from "react";
import { Typography, Row, Col, Card, Form, Input, Button, message, Divider } from "antd";
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    SendOutlined,
    FacebookFilled,
    LinkedinFilled,
    TwitterSquareFilled
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = (values) => {
        setLoading(true);
        console.log("Contact form values:", values);

        // Simulate API call
        setTimeout(() => {
            message.success("Message sent successfully! We'll get back to you soon.");
            form.resetFields();
            setLoading(false);
        }, 1500);
    };

    return (
        <div style={{ background: "#f9fafb", minHeight: "100vh" }}>

            {/* Hero Section */}
            <div style={{
                background: "#1f2937",
                color: "#fff",
                padding: "80px 20px 120px",
                textAlign: "center"
            }}>
                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <Title style={{ color: "#fff", fontSize: "3rem", fontWeight: 800, marginBottom: 24 }}>
                        Get in <span style={{ color: "#ED1B2F" }}>Touch</span>
                    </Title>
                    <Paragraph style={{ color: "#d1d5db", fontSize: "1.25rem", marginBottom: 0 }}>
                        We'd love to hear from you. Our team is always here to chat.
                    </Paragraph>
                </div>
            </div>

            {/* Main Content Card - Floating Effect */}
            <div style={{ maxWidth: 1200, margin: "-80px auto 60px", padding: "0 20px" }}>
                <Card bordered={false} style={{ borderRadius: 24, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <Row>
                        {/* Contact Info (Left Side) */}
                        <Col xs={24} lg={10} style={{ background: "#ED1B2F", padding: 60, color: "#fff" }}>
                            <Title level={3} style={{ color: "#fff", marginBottom: 24 }}>Contact Information</Title>
                            <Paragraph style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 40 }}>
                                Fill up the form and our Team will get back to you within 24 hours.
                            </Paragraph>

                            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <PhoneOutlined style={{ fontSize: 24 }} />
                                    <Text style={{ color: "#fff", fontSize: 16 }}>+1 (555) 123-4567</Text>
                                </div>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <MailOutlined style={{ fontSize: 24 }} />
                                    <Text style={{ color: "#fff", fontSize: 16 }}>hello@techtalent.com</Text>
                                </div>
                                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                    <EnvironmentOutlined style={{ fontSize: 24, marginTop: 4 }} />
                                    <Text style={{ color: "#fff", fontSize: 16 }}>
                                        123 Innovation Drive,<br />
                                        Silicon Valley, CA 94025
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginTop: 80 }}>
                                <div style={{ display: "flex", gap: 24 }}>
                                    <FacebookFilled style={{ fontSize: 24, cursor: "pointer", opacity: 0.8 }} />
                                    <TwitterSquareFilled style={{ fontSize: 24, cursor: "pointer", opacity: 0.8 }} />
                                    <LinkedinFilled style={{ fontSize: 24, cursor: "pointer", opacity: 0.8 }} />
                                </div>
                            </div>
                        </Col>

                        {/* Contact Form (Right Side) */}
                        <Col xs={24} lg={14} style={{ padding: 60, background: "#fff" }}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                                size="large"
                            >
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="firstName"
                                            label="First Name"
                                            rules={[{ required: true, message: "Please input First Name!" }]}
                                        >
                                            <Input placeholder="John" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="lastName"
                                            label="Last Name"
                                            rules={[{ required: true, message: "Please input Last Name!" }]}
                                        >
                                            <Input placeholder="Doe" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    name="email"
                                    label="Email Address"
                                    rules={[
                                        { required: true, message: "Please input Email!" },
                                        { type: "email", message: "Please enter a valid email!" }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined style={{ color: "#bfbfbf" }} />} placeholder="john@example.com" />
                                </Form.Item>

                                <Form.Item
                                    name="type"
                                    label="I am a..."
                                >
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        {['Candidate', 'Recruiter', 'Other'].map(type => (
                                            <Button key={type} shape="round" onClick={() => form.setFieldsValue({ topic: type })}>
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                    {/* Uncontrolled hidden input for form logic if needed, but simple handling for now */}
                                </Form.Item>

                                <Form.Item
                                    name="message"
                                    label="Message"
                                    rules={[{ required: true, message: "Please input your Message!" }]}
                                >
                                    <TextArea rows={4} placeholder="Write your message here..." />
                                </Form.Item>

                                <Form.Item style={{ marginTop: 32 }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        icon={<SendOutlined />}
                                        style={{ height: 48, fontSize: 16, fontWeight: 600, background: "#111827", borderColor: "#111827" }}
                                    >
                                        Send Message
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            </div>

            {/* Map Section (Placeholder) */}
            <div style={{ height: 400, width: "100%", background: "#e5e7eb", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.628236556408!2d-122.08627888469247!3d37.42230987982461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5a6e87f892b%3A0xc4b71e984180802a!2sGoogleplex!5e0!3m2!1sen!2sus!4v1626388484964!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "grayscale(100%)" }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Map"
                ></iframe>
            </div>

        </div>
    );
};

export default Contact;
