import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    const isAdminAuthenticated = localStorage.getItem('admin_authenticated') === 'true';

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && (!isAdminAuthenticated || role !== 'admin')) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
