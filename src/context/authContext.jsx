import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // if the token exist means user will saty logged In untille the refresh toek is expired , if not user will be logged out
    // console.log(user);
    
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        // if token exist means try to get the user data and If the token is expired means  - axios interceptor will handle the token refresh and retry the request , if refresh token is also expired means user will be logged out
        try {
            const response = await api.get('/auth/me');
            // Assuming response contains user details nested under data.data.user
            // based on standard backend conventions. 
            // Adjust if the backend returns it differently (e.g., response.data.user)
            setUser(response.data.data ? response.data.data.user : response.data.user);
        } catch (error) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            //we will remove the token from the local storage and set the user to null 
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
