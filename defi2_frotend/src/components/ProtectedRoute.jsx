import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Not logged in
    if (!userString || !token) {
        return <Navigate to="/auth?mode=login" />;
    }

    try {
        const user = JSON.parse(userString);

        // Not authorized for this role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect based on role or to home
            if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
            if (user.role === 'partner') return <Navigate to="/partner/dashboard" />;
            if (user.role === 'validator') return <Navigate to="/validator-dashboard" />;
            return <Navigate to="/donor-dashboard" />;
        }

        // Output children if authorized
        return children;

    } catch (e) {
        // Corrupted user data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return <Navigate to="/auth?mode=login" />;
    }
};

export default ProtectedRoute;
