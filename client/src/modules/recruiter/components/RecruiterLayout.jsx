import { useState } from "react";
import { Layout, Avatar } from "antd";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterHeader from "./RecruiterHeader";
import { useAuth } from "../../../context/AuthContext";

const { Content } = Layout;

const RecruiterLayout = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <RecruiterSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <Layout>
                <RecruiterHeader
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    user={user}
                />

                <Content style={{ padding: '32px', transition: 'all 0.2s', minHeight: 'calc(100vh - 72px)' }}>
                    {title && (
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
                        </div>
                    )}
                    {children}
                </Content>
            </Layout>

            <style>{`
                .recruiter-menu .ant-menu-item-selected {
                    background-color: #f5f3ff !important;
                    color: #4F46E5 !important;
                }
                .recruiter-menu .ant-menu-item-selected .anticon {
                    color: #4F46E5 !important;
                }
                .recruiter-menu .ant-menu-item:hover {
                    color: #4F46E5 !important;
                }
            `}</style>
        </Layout>
    );
};

export default RecruiterLayout;
