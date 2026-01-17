import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spin } from "antd";

const RecruiterRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
    }

    if (!user || user.role !== "RECRUITER") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RecruiterRoute;
