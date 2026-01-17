import { useState } from "react";
import { Layout, Avatar } from "antd";
import InterviewerSidebar from "./InterviewerSidebar";
import InterviewerHeader from "./InterviewerHeader";
import { useAuth } from "../../../context/AuthContext";

const { Content } = Layout;

const InterviewerLayout = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <InterviewerSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <Layout>
                <InterviewerHeader
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    user={user}
                />
                <Content style={{ padding: '32px', transition: 'all 0.2s', minHeight: '100vh' }}>
                    {title && (
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
                        </div>
                    )}
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default InterviewerLayout;
