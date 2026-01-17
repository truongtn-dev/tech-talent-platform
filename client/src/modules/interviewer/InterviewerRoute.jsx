import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spin } from 'antd';

const InterviewerRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Verifying access..." />
            </div>
        );
    }

    if (!user || (user.role !== 'INTERVIEWER' && user.role !== 'ADMIN')) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default InterviewerRoute;
