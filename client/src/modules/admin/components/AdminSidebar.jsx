import { Layout, Menu } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    AppstoreOutlined,
    ReadOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/admin.css";

const { Sider } = Layout;

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Active key logic
    const getActiveKey = () => {
        if (location.pathname.includes('/admin/users')) return 'users';
        if (location.pathname.includes('/admin/jobs')) return 'jobs';
        if (location.pathname.includes('/admin/blogs')) return 'blogs';
        return 'dashboard';
    };

    const menuItems = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/admin/dashboard') },
        { key: 'users', icon: <UserOutlined />, label: 'Manage Users', onClick: () => navigate('/admin/users') },
        { key: 'jobs', icon: <AppstoreOutlined />, label: 'Manage Jobs', onClick: () => navigate('/admin/jobs') },
        { key: 'blogs', icon: <ReadOutlined />, label: 'Manage Blogs', onClick: () => navigate('/admin/blogs') },
        { type: 'divider' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => { logout(); navigate("/login"); },
            danger: true
        },
    ];

    return (
        <Sider
            className="admin-sidebar"
            width={260}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            theme="light"
            breakpoint="lg"
        >
            <div style={{
                height: 72,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 16px'
            }}>
                {collapsed ? (
                    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="36" height="36" rx="8" fill="#ED1B2F" />
                        <path d="M10 10L18 18L10 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 26H28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="36" height="36" rx="8" fill="#ED1B2F" />
                            <path d="M10 10L18 18L10 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 26H28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
                            Tech<span style={{ color: '#ED1B2F' }}>Talent</span>
                        </span>
                    </div>
                )}
            </div>

            <Menu
                mode="inline"
                selectedKeys={[getActiveKey()]}
                items={menuItems}
                style={{ borderRight: 0 }}
            />
        </Sider>
    );
};

export default AdminSidebar;
