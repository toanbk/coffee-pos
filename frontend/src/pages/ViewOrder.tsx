import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/format';
import Header from '../components/Header';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { Order } from '../types';

const ViewOrder: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await orderService.getOrder(Number(orderId));
                setOrder(data);
            } catch (err) {
                setError(t('Order not found'));
            } finally {
                setLoading(false);
            }
        };
        if (orderId) fetchOrder();
    }, [orderId, t]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error || t('Order not found')}</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
                    {t('Back')}
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('View Order')} />
            <Box sx={{ p: 3 }}>
                <Paper sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', p: { xs: 1.25, sm: 5 }, width: '100%', maxWidth: 1024, margin: 'auto' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>{t('Order #')}: #{order.id}</Typography>
                    <Typography sx={{ mb: 1 }}>{t('Date')}: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</Typography>
                    <Typography sx={{ mb: 1 }}>{t('common.customer')}: {order.customer_name || t('common.noCustomer')}</Typography>
                    <Typography sx={{ mb: 1 }}>{t('common.paymentMethod')}: {order.payment_method_name || '-'}</Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('Product')}</TableCell>
                                    <TableCell>{t('Unit Price')}</TableCell>
                                    <TableCell>{t('Qty')}</TableCell>
                                    <TableCell>{t('Subtotal')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.items.map(item => (
                                    <TableRow key={item.product_id}>
                                        <TableCell>{item.product_name}</TableCell>
                                        <TableCell>{formatPrice(item.unit_price)}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{formatPrice((item as any).price !== undefined ? (item as any).price : item.unit_price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', fontSize: 18 }}>
                                        {t('Total')}:
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
                                        {formatPrice(order.total_amount)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
                        {t('Back')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        sx={{ mt: 3, ml: 2 }}
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        {t('Delete')}
                    </Button>
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={() => setDeleteDialogOpen(false)}
                    >
                        <DialogTitle>{t('Delete Order')}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {t('Are you sure you want to delete this order?')}
                            </DialogContentText>
                            {deleteError && (
                                <Typography color="error" sx={{ mt: 1 }}>{deleteError}</Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                                {t('Cancel')}
                            </Button>
                            <Button
                                onClick={async () => {
                                    setDeleting(true);
                                    setDeleteError(null);
                                    try {
                                        await orderService.deleteOrder(order.id);
                                        setDeleteDialogOpen(false);
                                        navigate('/order/history');
                                    } catch (err) {
                                        setDeleting(false);
                                        setDeleteError(t('Failed to delete order'));
                                    }
                                }}
                                color="error"
                                variant="contained"
                                disabled={deleting}
                            >
                                {t('Delete')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Box>
        </Box>
    );
};

export default ViewOrder; 