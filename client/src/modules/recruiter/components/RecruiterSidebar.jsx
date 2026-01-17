import { Layout, Menu } from "antd";
import {
    DashboardOutlined,
    AppstoreOutlined,
    TeamOutlined,
    CalendarOutlined,
    SettingOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/admin.css"; // Reuse general admin styles

const { Sider } = Layout;

const RecruiterSidebar = ({ collapsed, setCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveKey = () => {
        if (location.pathname.includes('/recruiter/jobs')) return 'jobs';
        if (location.pathname.includes('/recruiter/applications')) return 'applications';
        if (location.pathname.includes('/recruiter/interviews')) return 'interviews';
        return 'dashboard';
    };

    const menuItems = [
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate('/recruiter/dashboard') },
        { key: 'jobs', icon: <AppstoreOutlined />, label: 'Manage Jobs', onClick: () => navigate('/recruiter/jobs') },
        {
            key: 'applications',
            icon: <TeamOutlined />,
            label: 'AI Screening',
            onClick: () => navigate('/recruiter/applications')
        },
        { key: 'interviews', icon: <CalendarOutlined />, label: 'Interviews', onClick: () => navigate('/recruiter/interviews') },
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
            className="recruiter-sidebar"
            width={260}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            theme="light"
            breakpoint="lg"
            style={{
                boxShadow: '4px 0 16px rgba(0,0,0,0.02)',
                zIndex: 100
            }}
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
                        <rect width="36" height="36" rx="8" fill="#4F46E5" />
                        <path d="M10 10L18 18L10 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 26H28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="36" height="36" rx="8" fill="#4F46E5" />
                            <path d="M10 10L18 18L10 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 26H28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>
                            Tech<span style={{ color: '#4F46E5' }}>Recruit</span>
                        </span>
                    </div>
                )}
            </div>

            <Menu
                mode="inline"
                selectedKeys={[getActiveKey()]}
                items={menuItems}
                style={{ borderRight: 0, padding: '16px 8px' }}
                className="recruiter-menu"
            />
        </Sider>
    );
};

export default RecruiterSidebar;
