import React from "react";
import { Typography, Divider, Tag } from "antd";

const { Title, Text, Paragraph } = Typography;

const CVPreview = ({ data }) => {
    const { personalInfo = {}, experience = [], education = [], skills = [] } = data;

    return (
        <div
            id="cv-capture"
            style={{
                background: "white",
                minHeight: "1123px", // Exact A4 height in pixels (96 DPI)
                width: "794px",      // Exact A4 width
                display: "flex",
                boxShadow: "0 0 20px rgba(0,0,0,0.1)",
                fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
            }}
        >
            {/* LEFT COLUMN (35%) */}
            <div style={{
                width: "35%",
                background: "#f0f2f5",
                padding: "40px 25px",
                color: "#333",
                borderRight: "1px solid #e8e8e8"
            }}>
                {/* AVATAR / NAME SHORT */}
                <div style={{ marginBottom: 40, textAlign: "center" }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        background: "#ED1B2F",
                        color: "white",
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        fontWeight: "bold"
                    }}>
                        {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                </div>

                {/* CONTACT */}
                <div style={{ marginBottom: 40 }}>
                    <h3 style={{
                        textTransform: "uppercase",
                        fontSize: "14px",
                        letterSpacing: "2px",
                        borderBottom: "2px solid #333",
                        paddingBottom: 5,
                        marginBottom: 15
                    }}>Contact</h3>
                    <div style={{ fontSize: "14px", lineHeight: "1.8", wordBreak: "break-word" }}>
                        <div style={{ marginBottom: 8 }}><strong>Phone:</strong><br />{personalInfo.phone}</div>
                        <div style={{ marginBottom: 8 }}><strong>Email:</strong><br />{personalInfo.email}</div>
                        <div><strong>Address:</strong><br />{personalInfo.location}</div>
                    </div>
                </div>

                {/* EDUCATION */}
                {education.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <h3 style={{
                            textTransform: "uppercase",
                            fontSize: "14px",
                            letterSpacing: "2px",
                            borderBottom: "2px solid #333",
                            paddingBottom: 5,
                            marginBottom: 15
                        }}>Education</h3>
                        {education.map((edu, idx) => (
                            <div key={idx} style={{ marginBottom: 15 }}>
                                <div style={{ fontWeight: "bold", fontSize: "15px" }}>{edu?.school}</div>
                                <div style={{ fontSize: "14px", fontStyle: "italic" }}>{edu?.degree}</div>
                                <div style={{ fontSize: "12px", color: "#666" }}>{edu?.year}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SKILLS */}
                {skills.length > 0 && (
                    <div>
                        <h3 style={{
                            textTransform: "uppercase",
                            fontSize: "14px",
                            letterSpacing: "2px",
                            borderBottom: "2px solid #333",
                            paddingBottom: 5,
                            marginBottom: 15
                        }}>Skills</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {Array.isArray(skills) && skills.map((skill, idx) => (
                                <span key={idx} style={{
                                    background: "#e6e6e6",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    fontWeight: "500"
                                }}>
                                    {skill?.name || skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN (65%) */}
            <div style={{
                width: "65%",
                padding: "40px",
                background: "white"
            }}>
                {/* HEADER */}
                <div style={{ marginBottom: 30 }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: "36px",
                        fontWeight: "800",
                        color: "#2c3e50",
                        lineHeight: "1.2"
                    }}>
                        {personalInfo.fullName || "YOUR NAME"}
                    </h1>
                    <h2 style={{
                        margin: "10px 0 0",
                        fontSize: "18px",
                        color: "#ED1B2F",
                        textTransform: "uppercase",
                        letterSpacing: "2px"
                    }}>
                        {personalInfo.jobTitle || "PROFESSIONAL TITLE"}
                    </h2>
                </div>

                {/* SUMMARY */}
                {personalInfo.summary && (
                    <div style={{ marginBottom: 35 }}>
                        <h3 style={{
                            textTransform: "uppercase",
                            fontSize: "16px",
                            letterSpacing: "1px",
                            color: "#2c3e50",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: 8,
                            marginBottom: 15
                        }}>Profile</h3>
                        <p style={{ lineHeight: "1.6", color: "#444", fontSize: "15px" }}>
                            {personalInfo.summary}
                        </p>
                    </div>
                )}

                {/* EXPERIENCE */}
                {experience.length > 0 && (
                    <div>
                        <h3 style={{
                            textTransform: "uppercase",
                            fontSize: "16px",
                            letterSpacing: "1px",
                            color: "#2c3e50",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: 8,
                            marginBottom: 20
                        }}>Work Experience</h3>

                        {experience.map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: 25, position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ fontWeight: "700", fontSize: "18px", color: "#333" }}>
                                        {exp?.company || "Company"}
                                    </div>
                                    <div style={{
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#ED1B2F",
                                        background: "#fff0f1",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        height: "bit-content"
                                    }}>
                                        {exp?.period}
                                    </div>
                                </div>
                                <div style={{ fontSize: "15px", fontStyle: "italic", marginBottom: 8, color: "#666" }}>
                                    {exp?.role}
                                </div>
                                <p style={{ lineHeight: "1.6", color: "#444", fontSize: "14px", whiteSpace: "pre-line" }}>
                                    {exp?.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVPreview;
