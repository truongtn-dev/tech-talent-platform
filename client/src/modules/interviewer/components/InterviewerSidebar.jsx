import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    VideoCameraOutlined,
    SettingOutlined,
    ReadOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";

const { Sider } = Layout;

const InterviewerSidebar = ({ collapsed, setCollapsed }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveKey = () => {
        if (location.pathname.includes('/interviewer/questions')) return 'questions';
        if (location.pathname.includes('/interviewer/sessions')) return 'interviews';
        if (location.pathname.includes('/interviewer/results')) return 'results';
        return 'dashboard';
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/interviewer/dashboard')
        },
        {
            key: 'questions',
            icon: <BookOutlined />,
            label: 'Question Bank',
            onClick: () => navigate('/interviewer/questions')
        },
        {
            key: 'interviews',
            icon: <VideoCameraOutlined />,
            label: 'Interviews',
            onClick: () => navigate('/interviewer/sessions')
        },
        { type: 'divider' },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => { logout(); navigate("/login"); },
            danger: true
        }
    ];

    return (
        <Sider
            className="interviewer-sidebar"
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
                    <div style={{
                        width: 32,
                        height: 32,
                        background: "#10B981",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            background: "#10B981",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12L10 17L19 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: '#111' }}>
                            Tech<span style={{ color: '#10B981' }}>Interview</span>
                        </div>
                    </div>
                )}
            </div>
            <Menu
                mode="inline"
                selectedKeys={[getActiveKey()]}
                items={menuItems}
                style={{ borderRight: 0, padding: '16px 8px' }}
                className="interviewer-menu"
            />
            {/* Inject styles for Emerald theme on menu selection */}
            <style>{`
                .interviewer-menu .ant-menu-item-selected {
                    background-color: #ECFDF5 !important;
                    color: #10B981 !important;
                }
                .interviewer-menu .ant-menu-item-selected .anticon {
                    color: #10B981 !important;
                }
                .interviewer-menu .ant-menu-item:hover {
                    color: #10B981 !important;
                }
            `}</style>
        </Sider>
    );
};

export default InterviewerSidebar;
