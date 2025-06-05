import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { formatPrice } from '../utils/format';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { orderService } from '../services/api';
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
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

interface Order {
    id: number;
    order_date: string;
    total_quantity: number;
    total_amount: number;
}

const OrderHistory: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [dateFilter, setDateFilter] = useState('today');
    const [loading, setLoading] = useState(true);

    const dateFilterOptions = [
        { value: 'today', label: t('Today') },
        { value: 'yesterday', label: t('Yesterday') },
        { value: '7days', label: t('Past 7 days') },
        { value: '14days', label: t('Past 14 days') },
        { value: '30days', label: t('Past 30 days') }
    ];

    useEffect(() => {
        fetchOrders();
    }, [dateFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderHistory(dateFilter);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm(t('Are you sure you want to delete this order?'))) return;
        try {
            await orderService.deleteOrder(orderId);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('Order History')} />
            <Box sx={{ p: 3 }}>
                <Paper sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{t('Order History')}</Typography>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel>{t('Filter by date')}</InputLabel>
                            <Select
                                value={dateFilter}
                                label={t('Filter by date')}
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                {dateFilterOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('Order #')}</TableCell>
                                        <TableCell>{t('Date')}</TableCell>
                                        <TableCell>{t('Qty')}</TableCell>
                                        <TableCell>{t('Total')}</TableCell>
                                        <TableCell>{t('Action')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{format(new Date(order.order_date), 'dd/MM/yyyy HH:mm', { locale: vi })}</TableCell>
                                            <TableCell>{order.total_quantity}</TableCell>
                                            <TableCell>{formatPrice(order.total_amount)}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Typography
                                                        component="a"
                                                        href={`/order/view/${order.id}`}
                                                        sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', mr: 1 }}
                                                    >
                                                        {t('View Order')}
                                                    </Typography>
                                                    <Typography
                                                        component="span"
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        sx={{ color: 'error.main', cursor: 'pointer', textDecoration: 'underline' }}
                                                    >
                                                        {t('Delete')}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default OrderHistory; 