import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

interface User {
    id: number;
    username: string;
    email: string;
    role: number;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
    role: number;
    redirect_to: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<LoginResponse>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkAuth();
        }
    }, []);

    const checkAuth = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 2);
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    };

    const login = async (username: string, password: string): Promise<LoginResponse> => {
        const response = await authService.login(username, password);
        localStorage.setItem('token', response.access_token);
        setIsAuthenticated(true);
        setIsAdmin(response.role === 2);
        return response;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 