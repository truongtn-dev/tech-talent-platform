import React from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Avatar,
  Button,
  Statistic,
  Divider,
} from "antd";
import {
  RocketOutlined,
  TeamOutlined,
  GlobalOutlined,
  HeartOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
          color: "#fff",
          padding: "80px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <Title
            style={{
              color: "#fff",
              fontSize: "3rem",
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            We Are <span style={{ color: "#ED1B2F" }}>TechTalent</span>
          </Title>
          <Paragraph
            style={{
              color: "#d1d5db",
              fontSize: "1.25rem",
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Empowering the world's best tech companies to build the future by
            connecting them with extraordinary talent. We believe in potential,
            passion, and performance.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            style={{
              height: 50,
              padding: "0 40px",
              fontSize: 16,
              background: "#ED1B2F",
              borderColor: "#ED1B2F",
              borderRadius: 100,
            }}
            onClick={() => navigate("/jobs")}
          >
            Explore Opportunities
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px" }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderRadius: 16,
              }}
            >
              <Statistic
                title={<Text type="secondary">Active Candidates</Text>}
                value={12000}
                prefix={<UserOutlined style={{ color: "#4F46E5" }} />}
                suffix="+"
                valueStyle={{ fontWeight: 800, color: "#111" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderRadius: 16,
              }}
            >
              <Statistic
                title={<Text type="secondary">Partner Companies</Text>}
                value={500}
                prefix={<GlobalOutlined style={{ color: "#ED1B2F" }} />}
                suffix="+"
                valueStyle={{ fontWeight: 800, color: "#111" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderRadius: 16,
              }}
            >
              <Statistic
                title={<Text type="secondary">Successful Hires</Text>}
                value={8500}
                prefix={<CheckCircleOutlined style={{ color: "#10B981" }} />}
                suffix="+"
                valueStyle={{ fontWeight: 800, color: "#111" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                borderRadius: 16,
              }}
            >
              <Statistic
                title={<Text type="secondary">Countries</Text>}
                value={15}
                prefix={<RocketOutlined style={{ color: "#F59E0B" }} />}
                valueStyle={{ fontWeight: 800, color: "#111" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Mission & Vision */}
      <div style={{ background: "#f9fafb", padding: "80px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[64, 48]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Our Team"
                  style={{
                    width: "100%",
                    borderRadius: 24,
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -30,
                    right: -30,
                    background: "#fff",
                    padding: 30,
                    borderRadius: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    maxWidth: 200,
                  }}
                >
                  <Text
                    strong
                    style={{ fontSize: 16, display: "block", marginBottom: 8 }}
                  >
                    Our Mission
                  </Text>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    To democratize access to career opportunities globally.
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Title
                level={2}
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  marginBottom: 24,
                }}
              >
                Bridging the gap between{" "}
                <span style={{ color: "#4F46E5" }}>Talent</span> and{" "}
                <span style={{ color: "#4F46E5" }}>Opportunity</span>
              </Title>
              <Paragraph
                style={{
                  fontSize: 18,
                  lineHeight: 1.8,
                  color: "#4b5563",
                  marginBottom: 32,
                }}
              >
                Founded in 2023, TechTalent was born from a simple observation:
                great developers are everywhere, but great opportunities are
                not. We set out to build a platform that removes friction, bias,
                and geographical barriers from tech recruitment.
              </Paragraph>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      background: "#e0e7ff",
                      padding: 8,
                      borderRadius: 8,
                      color: "#4F46E5",
                    }}
                  >
                    <RiseOutlined />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      Data-Driven Matching
                    </Text>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      Advanced algorithms to ensure the perfect fit for both
                      sides.
                    </Paragraph>
                  </div>
                </div>
                <div
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      background: "#fee2e2",
                      padding: 8,
                      borderRadius: 8,
                      color: "#ef4444",
                    }}
                  >
                    <HeartOutlined />
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      Human-Centric Approach
                    </Text>
                    <Paragraph type="secondary" style={{ margin: 0 }}>
                      We value people over metrics. Every resume has a story.
                    </Paragraph>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Team Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <Tag
            color="purple"
            style={{ marginBottom: 16, padding: "4px 12px", borderRadius: 100 }}
          >
            THE SQUAD
          </Tag>
          <Title level={2} style={{ fontSize: "2.5rem", fontWeight: 800 }}>
            Meet Our Leadership
          </Title>
          <Paragraph
            type="secondary"
            style={{ fontSize: 18, maxWidth: 600, margin: "0 auto" }}
          >
            A diverse team of engineers, designers, and dreamers working
            together to redefine recruitment.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          {[
            {
              name: "Nguyen Hoang Dung",
              role: "Founder & CEO",
              img: "https://i.pravatar.cc/150?u=dung",
            },
            {
              name: "Sarah Jenkins",
              role: "Head of Product",
              img: "https://i.pravatar.cc/150?u=sarah",
            },
            {
              name: "David Chen",
              role: "CTO",
              img: "https://i.pravatar.cc/150?u=david",
            },
            {
              name: "Emily Watson",
              role: "Head of Growth",
              img: "https://i.pravatar.cc/150?u=emily",
            },
          ].map((member, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                bordered={false}
                style={{
                  textAlign: "center",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
                cover={
                  <div
                    style={{
                      height: 200,
                      overflow: "hidden",
                      background: "#f3f4f6",
                    }}
                  >
                    <img
                      alt={member.name}
                      src={member.img}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                }
              >
                <Title level={4} style={{ marginBottom: 4 }}>
                  {member.name}
                </Title>
                <Text
                  type="secondary"
                  style={{ color: "#ED1B2F", fontWeight: 500 }}
                >
                  {member.role}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: "#111827",
          color: "#fff",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Title
            level={2}
            style={{
              color: "#fff",
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            Ready to start your journey?
          </Title>
          <Paragraph
            style={{ color: "#9ca3af", fontSize: 18, marginBottom: 40 }}
          >
            Join thousands of developers and companies building the future
            together.
          </Paragraph>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/register")}
              style={{
                height: 50,
                padding: "0 40px",
                background: "#ED1B2F",
                borderColor: "#ED1B2F",
              }}
            >
              Join Now
            </Button>
            <Button
              size="large"
              ghost
              onClick={() => navigate("/jobs")}
              style={{ height: 50, padding: "0 40px" }}
            >
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import icons at the top if not present, but for now I'll assume they will be flagged if missing.
// Adding necessary imports above.
import { UserOutlined } from "@ant-design/icons";
import { Tag } from "antd";

export default About;
