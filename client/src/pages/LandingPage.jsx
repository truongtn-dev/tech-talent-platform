import { Link } from "react-router-dom";
import { Button, Row, Col, Typography, Avatar } from "antd";
import {
    RocketOutlined,
    GlobalOutlined,
    SafetyCertificateOutlined,
    TeamOutlined,
    ArrowRightOutlined,
    CheckCircleFilled,
    FireFilled,
    TrophyFilled,
    CodeOutlined,
    Html5Outlined,
    AndroidOutlined,
    AppleOutlined,
    WindowsOutlined,
    LinkedinFilled,
    BellFilled,
} from "@ant-design/icons";
import "../styles/landingPage.css";
import { useEffect, useRef, useState } from "react";

const { Title, Text } = Typography;

// --- Scroll Reveal Hook ---
const useScrollReveal = (threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold }
        );
        const { current } = domRef;
        if (current) observer.observe(current);
        return () => current && observer.unobserve(current);
    }, [threshold]);

    return [domRef, isVisible];
};

const RevealSection = ({ children, className = "", delay = 0 }) => {
    const [ref, isVisible] = useScrollReveal(0.15);
    return (
        <div
            ref={ref}
            className={`${className} reveal-on-scroll ${isVisible ? "is-visible" : ""}`}
            style={{ transitionDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
};

// Companies List
const COMPANIES = [
    "Google", "Microsoft", "Netflix", "Spotify", "Amazon", "Meta",
    "Grab", "Shopee", "GoJek", "Momo", "Zalo", "VNG", "FPT", "Viettel"
];

// Categories Data with Icons
const CATEGORIES = [
    { name: "ReactJS", icon: <CodeOutlined />, color: "#61DAFB" },
    { name: "NodeJS", icon: <GlobalOutlined />, color: "#339933" },
    { name: "Python", icon: <CodeOutlined />, color: "#3776AB" },
    { name: ".NET", icon: <WindowsOutlined />, color: "#512BD4" },
    { name: "Java", icon: <Html5Outlined />, color: "#007396" }, // Approx icon
    { name: "iOS", icon: <AppleOutlined />, color: "#000000" },
    { name: "Android", icon: <AndroidOutlined />, color: "#3DDC84" },
    { name: "Tester", icon: <SafetyCertificateOutlined />, color: "#FF5722" },
];

const LandingPage = () => {
    return (
        <div className="landing-premium">
            {/* Hero Section */}
            <section className="premium-hero">
                <div className="container">
                    <Row gutter={[48, 48]} align="middle">
                        <Col xs={24} lg={12}>
                            <RevealSection>
                                <div className="premium-tag">
                                    <FireFilled style={{ color: '#ff4d4f' }} />
                                    <span>#1 Platform for Elite Tech Talent</span>
                                </div>
                                <h1 className="premium-title">
                                    Connect with the <br />
                                    <span className="gradient-text">World's Best</span> <br />
                                    Recruiters.
                                </h1>
                                <p className="premium-desc">
                                    Stop searching, start working. We connect top-tier developers with
                                    leading tech companies through a streamlined, AI-powered process.
                                </p>
                                <div className="hero-actions">
                                    <Link to="/register">
                                        <Button type="primary" size="large" className="btn-premium-primary">
                                            Get Started <ArrowRightOutlined />
                                        </Button>
                                    </Link>
                                    <Link to="/jobs">
                                        <Button size="large" className="btn-premium-ghost">
                                            Browse Jobs
                                        </Button>
                                    </Link>
                                </div>
                                <div className="hero-stats">
                                    <div className="stat-item">
                                        <strong>500+</strong> <span>Companies</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item">
                                        <strong>10k+</strong> <span>Candidates</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item">
                                        <strong>98%</strong> <span>Success Rate</span>
                                    </div>
                                </div>
                            </RevealSection>
                        </Col>

                        <Col xs={24} lg={12} className="hero-image-col">
                            <RevealSection delay={0.2}>
                                <div className="hero-visual-complex">
                                    {/* Main Image Layer */}
                                    <div className="image-blob-bg"></div>
                                    <img
                                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                                        alt="HR Professional"
                                        className="main-hero-img"
                                    />

                                    {/* Floating Cards */}
                                    <div className="float-card card-interview">
                                        <div className="fc-icon"><BellFilled /></div>
                                        <div className="fc-content">
                                            <b>Interview Request</b>
                                            <small>Google Inc. sent you a request</small>
                                        </div>
                                    </div>

                                    <div className="float-card card-offer">
                                        <div className="fc-icon icon-success"><CheckCircleFilled /></div>
                                        <div className="fc-content">
                                            <b>Job Offer Received!</b>
                                            <small>Senior React Dev - $5,000</small>
                                        </div>
                                    </div>

                                    <div className="float-card card-user">
                                        <Avatar.Group maxCount={3}>
                                            <Avatar src="https://ui-avatars.com/api/?name=John+Doe&background=random" />
                                            <Avatar src="https://ui-avatars.com/api/?name=Jane+Smith&background=random" />
                                            <Avatar src="https://ui-avatars.com/api/?name=Bob+Ross&background=random" />
                                            <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                                        </Avatar.Group>
                                        <small className="join-text">Join 10k+ peers</small>
                                    </div>
                                </div>
                            </RevealSection>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* Infinite Marquee */}
            <section className="premium-marquee">
                <div className="marquee-wrapper">
                    <div className="marquee-track">
                        {[...COMPANIES, ...COMPANIES].map((company, index) => (
                            <div key={index} className="marquee-logo">{company}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose (Animated Borders) */}
            <section className="premium-features">
                <div className="container">
                    <div className="section-head-center">
                        <h2>Why Top Talent Choose Us</h2>
                        <p>More than just a job board. We build careers.</p>
                    </div>

                    <Row gutter={[32, 32]}>
                        {[
                            {
                                icon: <RocketOutlined />,
                                title: "Accelerated Growth",
                                desc: "Get matched with companies that prioritize mentorship and career ladders.",
                                color: "#1890ff"
                            },
                            {
                                icon: <SafetyCertificateOutlined />,
                                title: "Verified Authenticity",
                                desc: "Every job posting is vetted to ensure salary transparency and legitimacy.",
                                color: "#52c41a"
                            },
                            {
                                icon: <GlobalOutlined />,
                                title: "Global Opportunities",
                                desc: "Remote-first roles that let you work for Silicon Valley from anywhere.",
                                color: "#722ed1"
                            },
                            {
                                icon: <TeamOutlined />,
                                title: "Community Access",
                                desc: "Join exclusive tech talks (webinars), networking events, and hackathons.",
                                color: "#faad14"
                            }
                        ].map((item, idx) => (
                            <Col xs={24} md={12} lg={6} key={idx}>
                                <RevealSection delay={idx * 0.1}>
                                    <div className="feature-box-animated" style={{ '--accent-color': item.color }}>
                                        <div className="fb-content">
                                            <div className="fb-icon" style={{ color: item.color }}>{item.icon}</div>
                                            <h3>{item.title}</h3>
                                            <p>{item.desc}</p>
                                        </div>
                                        <div className="fb-border-top"></div>
                                        <div className="fb-border-right"></div>
                                        <div className="fb-border-bottom"></div>
                                        <div className="fb-border-left"></div>
                                    </div>
                                </RevealSection>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* How It Works (Redesigned) */}
            <section className="premium-steps">
                <div className="container">
                    <RevealSection>
                        <h2 className="steps-title">Your Journey to Success</h2>
                    </RevealSection>

                    <RevealSection delay={0.2}>
                        <div className="process-flow">
                            <div className="process-step">
                                <div className="p-num">01</div>
                                <div className="p-card">
                                    <div className="p-icon"><LinkedinFilled /></div>
                                    <h3>Create Profile</h3>
                                    <p>Import from LinkedIn or upload CV in seconds.</p>
                                </div>
                            </div>
                            <div className="process-connector">
                                <div className="moving-dot"></div>
                            </div>
                            <div className="process-step">
                                <div className="p-num">02</div>
                                <div className="p-card">
                                    <div className="p-icon"><FireFilled /></div>
                                    <h3>Get Matched</h3>
                                    <p>AI suggests jobs that fit your stack & salary.</p>
                                </div>
                            </div>
                            <div className="process-connector">
                                <div className="moving-dot"></div>
                            </div>
                            <div className="process-step">
                                <div className="p-num">03</div>
                                <div className="p-card">
                                    <div className="p-icon"><TrophyFilled /></div>
                                    <h3>Get Hired</h3>
                                    <p>Accept offers and start your new chapter.</p>
                                </div>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* Categories Grid (Visual) */}
            <section className="premium-categories">
                <div className="container">
                    <h2 className="section-head-center">Trending Technologies</h2>
                    <div className="tech-grid">
                        {CATEGORIES.map((cat, i) => (
                            <RevealSection delay={i * 0.1} key={i}>
                                <Link to={`/jobs?q=${cat.name}`} className="tech-card">
                                    <div className="tc-icon" style={{ color: cat.color }}>
                                        {cat.icon}
                                    </div>
                                    <span className="tc-name">{cat.name}</span>
                                    <div className="tc-bg" style={{ background: cat.color }}></div>
                                </Link>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="premium-cta">
                <div className="container">
                    <div className="cta-gradient-box">
                        <div className="cta-circle-1"></div>
                        <div className="cta-circle-2"></div>
                        <div className="cta-content-z">
                            <RevealSection>
                                <h2>Ready to upgrade your career?</h2>
                                <p>Join the community of developers who have found their dream jobs.</p>
                                <Link to="/register">
                                    <Button type="primary" size="large" className="btn-cta-glac">
                                        Join Talent Pool Now
                                    </Button>
                                </Link>
                            </RevealSection>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
