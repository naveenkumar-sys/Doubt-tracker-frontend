import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/authContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect them away from login
    if (user) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            return toast.error("Please fill in all fields");
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            
            // The backend sends token and user details
            // The backend sends token and user details inside response.data.data
            const userData = response.data.data.user;
            const token = response.data.data.accessToken;
            
            // Save to context and local storage
            login(userData, token);
            toast.success("Login successful!");
            
            // Redirect based on role
            navigate(`/${userData.role}`);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

   
    

    return (
        <div className="min-h-screen bg-[#0e52b8] flex items-center justify-center p-4">
            {/* Main Container */}
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 md:min-h-[600px]">
                
                {/* Left Side - Welcome (Blue Gradient with Spheres) - Hidden on Mobile */}
                <div className="hidden md:flex relative w-1/2 bg-gradient-to-br from-[#0061ff] to-[#003899] text-white p-12 flex-col justify-center overflow-hidden">
                    {/* Decorative Spheres */}
                    <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gradient-to-tr from-[#0047cc] to-[#3385ff] rounded-full shadow-lg opacity-80"></div>
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-tl from-[#003da6] to-[#0066ff] rounded-full shadow-2xl"></div>
                    <div className="absolute bottom-[-15%] left-[-10%] w-72 h-72 bg-gradient-to-tr from-[#002f80] to-[#005ce6] rounded-full shadow-inner opacity-90"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold tracking-wider mb-2">WELCOME</h1>
                        <h2 className="text-xl font-semibold tracking-widest text-blue-100 mb-6 uppercase">TO DOUBT TRACKER</h2>
                        <p className="text-sm text-blue-100 leading-relaxed max-w-sm">
                            Your centralized platform for resolving academic questions and bridging the gap between students and faculty. Log in to access your personalized dashboard.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative z-10">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Sign in</h2>
                        <p className="text-gray-500 text-sm mb-10">Enter your credentials to access your account</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Input */}
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#f4f7f6] text-gray-800 text-sm rounded-lg pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-[#005ce6] transition-all"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-[#f4f7f6] text-gray-800 text-sm rounded-lg pl-12 pr-20 py-4 outline-none focus:ring-2 focus:ring-[#005ce6] transition-all"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-xs font-semibold text-[#003899] hover:text-[#005ce6] tracking-wide"
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between mt-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-[#005ce6] rounded border-gray-300 focus:ring-[#005ce6]" />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm font-medium text-[#003899] hover:text-[#005ce6]">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full mt-6 py-4 rounded-lg text-white font-semibold shadow-lg transition-all ${
                                    loading ? 'bg-[#3b82f6] cursor-not-allowed' : 'bg-[#002f80] hover:bg-[#003da6]'
                                }`}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                            
                            <div className="mt-8 text-center text-sm text-gray-500">
                                Don't have an account? <span className="font-semibold text-[#003899]">Contact your HOD</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;