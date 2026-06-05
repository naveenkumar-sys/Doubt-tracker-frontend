import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RoleRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    //     <Route element={<RoleRoute allowedRoles={["admin"]} />}>
    //     <Route path="/admin" element={<AdminDashboard />} />
    // </Route>
    // If allowed Roles are nto in the users role means then it will redirect to the unauthorized page
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
