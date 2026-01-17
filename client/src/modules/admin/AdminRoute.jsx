import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spin } from "antd";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
    }

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;
