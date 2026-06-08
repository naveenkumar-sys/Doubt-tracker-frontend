import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/authContext';

const FacultyNavbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 shadow-sm sm:px-8">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
                    <BookOpen size={18} className="text-white" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900 sm:text-base">Doubt Tracker</span>
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{user?.role.toUpperCase()}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {(user?.collegeName || user?.departmentName) && (
                        <p className="text-xs text-gray-400">{user?.collegeName}{user?.collegeName && user?.departmentName ? ' - ' : ''}{user?.departmentName}</p>
                    )}
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default FacultyNavbar;
