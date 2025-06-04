import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer } from 'recharts';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

interface OverviewData {
    total_orders: number;
    total_revenue: number;
}

interface ProductRevenue {
    product_name: string;
    quantity: number;
    total_price: number;
}

interface DailyRevenue {
    date: string;
    revenue: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

const Report: React.FC = () => {
    const [overview, setOverview] = useState<OverviewData>({ total_orders: 0, total_revenue: 0 });
    const [productRevenues, setProductRevenues] = useState<ProductRevenue[]>([]);
    const [dailyRevenues, setDailyRevenues] = useState<DailyRevenue[]>([]);
    const [monthlyRevenues, setMonthlyRevenues] = useState<MonthlyRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!isAdmin) {
            navigate('/order');
            return;
        }
        loadReportData();
    }, [isAdmin, navigate]);

    const loadReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load overview data
            const overviewData = await orderService.getOverviewReport();
            setOverview(overviewData);

            // Load product revenue data
            const productData = await orderService.getProductRevenueReport();
            setProductRevenues(productData);

            // Load daily revenue data
            const dailyData = await orderService.getDailyRevenueReport();
            setDailyRevenues(dailyData);

            // Load monthly revenue data
            const monthlyData = await orderService.getMonthlyRevenueReport();
            setMonthlyRevenues(monthlyData);
        } catch (error: any) {
            console.error('Error loading report data:', error);
            if (error.response?.status === 403) {
                navigate('/order');
            } else {
                setError('Failed to load report data. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('common.report')} />
            <Box sx={{ p: 3 }}>
                {/* Overview Section */}
                <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3, 
                    mb: 4, 
                    justifyContent: 'center' 
                }}>
                    <Box sx={{ 
                        flex: '1 1 300px',
                        maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }
                    }}>
                        <Paper sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            height: '100%'
                        }}>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                {t('report.totalOrders')}
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {overview.total_orders}
                            </Typography>
                        </Paper>
                    </Box>
                    <Box sx={{ 
                        flex: '1 1 300px',
                        maxWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }
                    }}>
                        <Paper sx={{ 
                            p: 3, 
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            height: '100%'
                        }}>
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                                {t('report.totalRevenue')}
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatPrice(overview.total_revenue)}
                            </Typography>
                        </Paper>
                    </Box>
                </Box>

                {/* Revenue by Product Table */}
                <Paper sx={{ 
                    mb: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                }}>
                    <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        {t('report.revenueByProduct')}
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('common.productName')}</TableCell>
                                    <TableCell align="right">{t('common.quantity')}</TableCell>
                                    <TableCell align="right">{t('common.price')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productRevenues.map((row) => (
                                    <TableRow key={row.product_name}>
                                        <TableCell>{row.product_name}</TableCell>
                                        <TableCell align="right">{row.quantity}</TableCell>
                                        <TableCell align="right">{formatPrice(row.total_price)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Daily Revenue Chart */}
                <Paper sx={{ 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    mb: 4
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('report.revenueLast7Days')}
                    </Typography>
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={dailyRevenues}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => formatPrice(value)}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip 
                                    formatter={(value) => formatPrice(value as number)}
                                    labelFormatter={(label) => `${t('report.date')}: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="#2EBD85" name={t('report.revenue')} />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#ff7300" 
                                    name={t('report.trend')}
                                    strokeWidth={2}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>

                {/* Monthly Revenue Chart (last 3 months) */}
                <Paper sx={{ 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('report.revenueLast3Months')}
                    </Typography>
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={monthlyRevenues}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="month" 
                                    angle={-15}
                                    textAnchor="end"
                                    height={50}
                                    tick={{ fontSize: 14 }}
                                />
                                <YAxis 
                                    tickFormatter={(value) => formatPrice(value)}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip 
                                    formatter={(value) => formatPrice(value as number)}
                                    labelFormatter={(label) => `${t('report.month')}: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="#1976d2" name={t('report.revenue')} />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#ff7300" 
                                    name={t('report.trend')}
                                    strokeWidth={2}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default Report; 