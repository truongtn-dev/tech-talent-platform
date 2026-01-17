import { Layout, Button, Avatar, Dropdown, Space, Typography } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    BellOutlined
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const AdminHeader = ({ collapsed, setCollapsed, user }) => {
    const userMenu = {
        items: [
            { key: 'profile', label: 'My Profile' },
            { key: 'settings', label: 'Account Settings' },
            { type: 'divider' },
            { key: 'logout', label: 'Logout', danger: true },
        ]
    };

    return (
        <Header className="admin-header" style={{ height: '72px', lineHeight: '72px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{ fontSize: '18px', width: 48, height: 48 }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: '18px' }} />}
                    shape="circle"
                    style={{ width: 40, height: 40 }}
                />

                <Dropdown menu={userMenu} trigger={['click']}>
                    <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
                        <Avatar src={user?.avatar || null} icon={<UserOutlined />} size={40} />
                        <div style={{ lineHeight: 1.3 }}>
                            <Text strong style={{ display: 'block', fontSize: '15px' }}>
                                {user?.email?.split('@')[0]}
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 600 }}>
                                Administrator
                            </Text>
                        </div>
                    </Space>
                </Dropdown>
            </div>
        </Header>
    );
};

export default AdminHeader;
