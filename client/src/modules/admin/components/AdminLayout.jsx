import { useState } from "react";
import { Layout } from "antd";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAuth } from "../../../context/AuthContext";

const { Content } = Layout;

const AdminLayout = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <Layout className="admin-layout-wrapper" style={{ minHeight: '100vh' }}>
            <AdminSidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <Layout>
                <AdminHeader
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    user={user}
                />

                <Content>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ margin: 0 }}>{title}</h2>
                    </div>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
