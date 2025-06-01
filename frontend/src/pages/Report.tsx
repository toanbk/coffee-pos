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
    Grid,
    CircularProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer } from 'recharts';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

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

const Report = () => {
    const [overview, setOverview] = useState<OverviewData>({ total_orders: 0, total_revenue: 0 });
    const [productRevenues, setProductRevenues] = useState<ProductRevenue[]>([]);
    const [dailyRevenues, setDailyRevenues] = useState<DailyRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

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
        <Box sx={{ p: 3 }}>
            {/* Overview Section */}
            <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Total Orders
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {overview.total_orders}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Total Revenue
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {formatPrice(overview.total_revenue)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Revenue by Product Table */}
            <Paper sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    Revenue by Product
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product Name</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Total Price</TableCell>
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
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Revenue Last 7 Days
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
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#2EBD85" name="Revenue" />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#ff7300" 
                                name="Trend"
                                strokeWidth={2}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default Report; 