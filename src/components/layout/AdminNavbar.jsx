import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/authContext';

const AdminNavbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-white" />
                </div>
                <div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">ClarifyHub</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{user?.role.toUpperCase()}</span>
                </div>
            </div>

            {/* Right: User Info + Logout */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition font-medium"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
