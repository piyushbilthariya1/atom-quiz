import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');

    if (token) {
        // Redirect logged-in users to their appropriate dashboard
        if (role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/join" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
