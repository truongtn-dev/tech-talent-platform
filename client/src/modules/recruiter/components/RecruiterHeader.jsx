import { Layout, Button, Avatar, Space, Badge, Dropdown, Typography } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BellOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import { useSocket } from "../../../context/SocketContext";

const { Header } = Layout;
const { Text } = Typography;

const RecruiterHeader = ({ collapsed, setCollapsed, user }) => {
    const { unreadCount, notifications, markAllRead } = useSocket();

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <Header className="admin-header" style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 99,
            height: 72
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '18px' }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Dropdown
                    trigger={['click']}
                    placement="bottomRight"
                    dropdownRender={() => (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <span>Notifications</span>
                                <Button type="link" size="small" onClick={markAllRead}>Mark all as read</Button>
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                                            <div className="notification-content">
                                                <div className="notification-title" style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                                                <div className="notification-message" style={{ fontSize: 12, color: '#64748b' }}>{n.message}</div>
                                                <div className="notification-time" style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                                    {new Date(n.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                            {!n.isRead && <div className="unread-dot" style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                >
                    <Badge count={unreadCount} size="small">
                        <Button
                            type="text"
                            icon={<BellOutlined style={{ fontSize: 20, color: '#6b7280' }} />}
                            shape="circle"
                        />
                    </Badge>
                </Dropdown>

                <div style={{ height: 24, width: 1, background: '#e5e7eb' }} />

                <Space style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                            {user?.profile?.fullName || user?.email?.split('@')[0] || 'Recruiter'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Talent Acquisition</div>
                    </div>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'logout',
                                    label: 'Logout',
                                    danger: true,
                                    icon: <LogoutOutlined />,
                                    onClick: logout
                                }
                            ]
                        }}
                    >
                        <Avatar
                            src={user?.avatar}
                            size={42}
                            style={{
                                border: '2px solid #e5e7eb',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                background: '#4F46E5',
                                cursor: 'pointer'
                            }}
                        >
                            {user?.email?.[0]?.toUpperCase() || 'R'}
                        </Avatar>
                    </Dropdown>
                </Space>
            </div>
        </Header>
    );
};

export default RecruiterHeader;
