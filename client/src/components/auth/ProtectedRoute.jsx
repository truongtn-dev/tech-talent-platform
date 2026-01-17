import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spin } from "antd";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect based on role if they are logged in but don't have permission
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
        if (user.role === 'INTERVIEWER') return <Navigate to="/interviewer/dashboard" replace />;
        if (user.role === 'CANDIDATE') return <Navigate to="/" replace />;

        return <Navigate to="/" replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
