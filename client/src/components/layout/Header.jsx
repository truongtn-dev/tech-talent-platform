import React, { useState } from "react";
import { Layout, Menu, Button, Drawer, Dropdown, Avatar, Badge, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/header.css";
import { BellOutlined, UserOutlined, MenuOutlined, LogoutOutlined } from "@ant-design/icons";

const { Header: AntHeader } = Layout;

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to get role badge properties
  const getRoleBadge = (role) => {
    switch (role) {
      case "CANDIDATE":
        return { text: "Candidate", color: "#52c41a" }; // Green
      case "RECRUITER":
        return { text: "Recruiter", color: "#1890ff" }; // Blue
      case "ADMIN":
        return { text: "Admin", color: "#f5222d" }; // Red
      default:
        return { text: "User", color: "#d9d9d9" }; // Grey
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const items = [
      { key: "/jobs", label: <Link to="/jobs">Jobs</Link> },
      { key: "/about", label: <Link to="/about">About</Link> },
      { key: "/blog", label: <Link to="/blog">Blog</Link> },
      { key: "/contact", label: <Link to="/contact">Contact</Link> },
    ];

    if (!user) {
      return items;
    }

    if (user?.role === "CANDIDATE") {
      const userItems = [
        { key: "/jobs", label: <Link to="/jobs">Jobs</Link> },
        {
          key: "/applications",
          label: <Link to="/applications">My Applications</Link>,
        },
      ];
      return userItems;
    }

    if (user?.role === "RECRUITER") {
      return [
        {
          key: "/recruiter/jobs",
          label: <Link to="/recruiter/jobs">Dashboard</Link>,
        },
        {
          key: "/recruiter/applications",
          label: <Link to="/recruiter/applications">Candidates</Link>,
        },
      ];
    }

    if (user?.role === "ADMIN") {
      return [{ key: "/admin/dashboard", label: <Link to="/admin/dashboard">Admin Panel</Link> }];
    }

    return items;
  };

  const userMenuItems = [
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: "change-password",
      label: <Link to="/profile">Change Password</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={logout}
          style={{ width: "100%", textAlign: "left", paddingLeft: 0 }}
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon-wrapper">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="36" height="36" rx="8" fill="#ED1B2F" />
              <path
                d="M10 10L18 18L10 26"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 26H28"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="logo-text-wrapper">
            <span className="logo-text-primary">Tech</span>
            <span className="logo-text-secondary">Talent</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={getNavItems()}
            className="nav-menu"
            disabledOverflow={true}
          />
        </div>

        {/* Right Section */}
        <div className="header-right">
          {user ? (
            <div className="user-actions">
              <Badge count={3} size="small" className="notification-badge">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="icon-button"
                />
              </Badge>

              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
                trigger={["click"]}
              >
                <div className="user-profile">
                  <Avatar
                    size="default"
                    src={user?.avatar}
                    icon={<UserOutlined />}
                    className="user-avatar"
                    style={{
                      backgroundColor: getRoleBadge(user?.role).color,
                      cursor: "pointer",
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase()}
                  </Avatar>
                  <div className="user-info">
                    <span className="user-name">
                      {user?.profile?.fullName || user?.email?.split("@")[0]}
                    </span>
                    <span
                      className="user-role"
                      style={{ color: getRoleBadge(user?.role).color }}
                    >
                      {getRoleBadge(user?.role).text}
                    </span>
                  </div>
                </div>
              </Dropdown>
            </div>
          ) : (
            <div className="auth-buttons desktop-auth">
              <Link to="/login">
                <Button type="text" className="login-button">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button type="primary" className="register-button">
                  Join Talent Pool
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <Button
            className="mobile-toggle-btn"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          className="mobile-drawer-custom"
        >
          <Menu
            mode="vertical"
            selected Keys={[location.pathname]}
            items={getNavItems()}
            className="drawer-menu"
            onClick={() => setMobileMenuOpen(false)}
          />
          {!user && (
            <div className="drawer-auth">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button block className="mb-2">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button type="primary" block>Join Talent Pool</Button>
              </Link>
            </div>
          )}
        </Drawer>
      </div>
    </AntHeader>
  );
};

export default Header;
