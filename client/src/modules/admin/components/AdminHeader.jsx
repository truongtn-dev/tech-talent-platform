import { Layout, Button, Avatar, Dropdown, Space, Typography, Badge } from "antd";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BellOutlined
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const AdminHeader = ({ collapsed, setCollapsed, user }) => {
    // Simplified menu - removed Profile/Settings as requested
    const userMenu = {
        items: [
            {
                key: 'logout',
                label: 'Logout',
                danger: true,
                onClick: () => {
                    // Handle logout logic here or pass logout function as prop
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
            },
        ]
    };

    return (
        <Header className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '18px' }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Badge count={2} dot offset={[-4, 4]}>
                    <Button
                        type="text"
                        icon={<BellOutlined style={{ fontSize: 20, color: '#6b7280' }} />}
                        shape="circle"
                    />
                </Badge>

                <div style={{ height: 24, width: 1, background: '#e5e7eb' }} />

                <Space style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                            {user?.profile?.fullName || user?.email?.split('@')[0] || 'Admin System'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>Administrator</div>
                    </div>
                    <Avatar
                        src={user?.avatar}
                        size={42}
                        style={{
                            border: '2px solid #e5e7eb',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            background: '#1890ff'
                        }}
                    >
                        {user?.email?.[0]?.toUpperCase() || 'A'}
                    </Avatar>
                </Space>
            </div>
        </Header>
    );
};

export default AdminHeader;
