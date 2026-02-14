import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            // If 401, maybe logout?
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for token on mount
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
        // We set loading false inside fetchUserProfile or finally block usually, 
        // but here let's just do it after strict check
        // To be safe:
        if (!token) setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Adjust endpoint based on backend docs: POST /api/v1/auth/login
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Fetch validation and profile
            await fetchUserProfile();

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Login failed"
            };
        }
    };

    const register = async (userData) => {
        try {
            // POST /api/v1/auth/register
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            console.error("Register error:", error);
            return {
                success: false,
                message: error.response?.data?.detail || "Registration failed"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading, isModalOpen, openModal, closeModal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
