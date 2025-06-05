import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Login from './pages/Login';
import Order from './pages/Order';
import Report from './pages/Report';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './i18n'; // Import i18n configuration
import OrderHistory from './pages/OrderHistory';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
                        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
                        <Route path="/order/history" element={<OrderHistory />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
