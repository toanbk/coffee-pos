import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Order from './pages/Order';
import Report from './pages/Report';
import './App.css';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order"
                element={
                    <ProtectedRoute>
                        <Order />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/report"
                element={
                    <ProtectedRoute requireAdmin>
                        <Report />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
};

export default App;
