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
                padding: '0 24px'
            }}>
                <div style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: '#ED1B2F',
                    letterSpacing: '-0.5px'
                }}>
                    {collapsed ? 'TT' : 'TECH TALENT'}
                </div>
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
