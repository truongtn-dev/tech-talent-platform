import { Layout, Row, Col, Input, Button, Space, Divider } from "antd";
import { Link } from "react-router-dom";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  MailOutlined,
  GlobalOutlined,
  HeartFilled,
} from "@ant-design/icons";
import "../../styles/footer.css";

const { Footer: AntFooter } = Layout;
const { Search } = Input;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (value) => {
    console.log("Newsletter subscription:", value);
    // Add newsletter subscription logic here
  };

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Find Jobs", path: "/jobs" },
        { label: "For Recruiters", path: "/recruiter" },
        { label: "For Companies", path: "/companies" },
        { label: "Pricing", path: "/pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Career Guide", path: "/resources/guide" },
        { label: "Blog", path: "/blog" },
        { label: "Help Center", path: "/help" },
        { label: "API Documentation", path: "/docs/api" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Careers", path: "/careers" },
        { label: "Press Kit", path: "/press" },
        { label: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
        { label: "Cookie Policy", path: "/cookies" },
        { label: "GDPR", path: "/gdpr" },
      ],
    },
  ];

  const socialLinks = [
    { icon: <GithubOutlined />, url: "https://github.com", label: "GitHub" },
    { icon: <TwitterOutlined />, url: "https://twitter.com", label: "Twitter" },
    {
      icon: <LinkedinOutlined />,
      url: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: <FacebookOutlined />,
      url: "https://facebook.com",
      label: "Facebook",
    },
  ];

  return (
    <AntFooter className="app-footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer-main">
          <Row gutter={[48, 32]}>
            {/* Brand & Newsletter Column */}
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div className="footer-brand">
                <Link to="/" className="footer-logo">
                  <div className="footer-logo-icon-wrapper">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="36" height="36" rx="8" fill="#ED1B2F" />
                      <path
                        d="M10 10L18 18L10 26"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 26H28"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="footer-logo-text">Tech Talent</span>
                </Link>
                <p className="footer-tagline">
                  Connecting exceptional talent with outstanding opportunities.
                  Your career journey starts here.
                </p>

                {/* Newsletter */}
                <div className="footer-newsletter">
                  <h4 className="newsletter-title">
                    Subscribe to our Newsletter
                  </h4>
                  <Search
                    placeholder="Your email address"
                    enterButton="Subscribe"
                    size="large"
                    prefix={<MailOutlined className="text-gray-400" />}
                    onSearch={handleNewsletterSubmit}
                    className="newsletter-input"
                  />
                  <p className="newsletter-hint">
                    Join 10,000+ others and get the latest jobs and career tips.
                  </p>
                </div>
              </div>
            </Col>

            {/* Links Columns */}
            {footerSections.map((section, index) => (
              <Col xs={12} sm={12} md={6} lg={4} xl={4} key={index}>
                <div className="footer-section">
                  <h4 className="footer-section-title">{section.title}</h4>
                  <ul className="footer-links">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link to={link.path}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <Divider className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            {/* Copyright */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <div className="footer-copyright">
                <span>© {currentYear} Tech Talent Platform.</span>
                <span className="copyright-separator">•</span>
                <span>All rights reserved.</span>
                <span className="copyright-separator">•</span>
                <span className="made-with-love">
                  Made with <HeartFilled className="heart-icon" /> in Vietnam
                </span>
              </div>
            </Col>

            {/* Social Links & Language */}
            <Col xs={24} sm={24} md={12} lg={12}>
              <div className="footer-actions">
                {/* Social Links */}
                <Space size="small" className="footer-social">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
