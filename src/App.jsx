import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import HodDashboard from './pages/hod/HodDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import Login from './pages/Login';
import Unauthorised from './pages/Unauthorised';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorised />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>

                        {/* Default redirect  and we are routing the user to login page even the user stay logged in so that we use like this */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Admin Routes */}
                        <Route element={<RoleRoute allowedRoles={['admin']} />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>

                        {/* HOD Routes */}
                        <Route element={<RoleRoute allowedRoles={['hod']} />}>
                            <Route path="/hod" element={<HodDashboard />} />
                        </Route>

                        {/* Faculty Routes */}
                        <Route element={<RoleRoute allowedRoles={['faculty']} />}>
                            <Route path="/faculty" element={<FacultyDashboard />} />
                        </Route>

                        {/* Student Routes */}
                        <Route element={<RoleRoute allowedRoles={['student']} />}>
                            <Route path="/student" element={<StudentDashboard />} />
                        </Route>
                    </Route>

                    {/* Catch all for 404 */}
                    <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl font-bold">404 Not Found</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};
export default App;