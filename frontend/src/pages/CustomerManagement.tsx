import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as ActivateIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { customerService } from '../services/api';
import { Customer } from '../types';
import Header from '../components/Header';

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        address: '',
        city: '',
        sort_order: 0,
        is_active: true
    });
    const { t } = useTranslation();

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerService.getCustomers();
            setCustomers(data);
        } catch (error) {
            setError('Failed to load customers');
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                customer_name: customer.customer_name,
                phone: customer.phone || '',
                address: customer.address || '',
                city: customer.city || '',
                sort_order: customer.sort_order,
                is_active: customer.is_active
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                customer_name: '',
                phone: '',
                address: '',
                city: '',
                sort_order: 0,
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCustomer(null);
        setFormData({
            customer_name: '',
            phone: '',
            address: '',
            city: '',
            sort_order: 0,
            is_active: true
        });
    };

    const handleSave = async () => {
        try {
            if (editingCustomer) {
                await customerService.updateCustomer(editingCustomer.id, formData);
                setSuccess(t('customer.customerUpdated'));
            } else {
                await customerService.createCustomer(formData);
                setSuccess(t('customer.customerAdded'));
            }
            handleCloseDialog();
            loadCustomers();
        } catch (error) {
            setError('Failed to save customer');
            console.error('Error saving customer:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await customerService.deleteCustomer(id);
            setSuccess(t('customer.customerDeleted'));
            loadCustomers();
        } catch (error) {
            setError('Failed to delete customer');
            console.error('Error deleting customer:', error);
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await customerService.activateCustomer(id);
            setSuccess(t('customer.customerActivated'));
            loadCustomers();
        } catch (error) {
            setError('Failed to activate customer');
            console.error('Error activating customer:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('customer.customerManagement')} />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h1">
                        {t('customer.customerManagement')}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        {t('customer.addCustomer')}
                    </Button>
                </Box>

                <Paper sx={{ border: 1, borderColor: 'divider' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('customer.customerName')}</TableCell>
                                    <TableCell>{t('customer.phone')}</TableCell>
                                    <TableCell>{t('customer.address')}</TableCell>
                                    <TableCell>{t('customer.city')}</TableCell>
                                    <TableCell>Sort Order</TableCell>
                                    <TableCell>{t('customer.status')}</TableCell>
                                    <TableCell align="center">{t('customer.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>{customer.customer_name}</TableCell>
                                        <TableCell>{customer.phone || '-'}</TableCell>
                                        <TableCell>{customer.address || '-'}</TableCell>
                                        <TableCell>{customer.city || '-'}</TableCell>
                                        <TableCell>{customer.sort_order}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={customer.is_active ? t('customer.active') : t('customer.inactive')}
                                                color={customer.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(customer)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            {customer.is_active ? (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(customer.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleActivate(customer.id)}
                                                    color="success"
                                                >
                                                    <ActivateIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                {/* Add/Edit Customer Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {editingCustomer ? t('customer.editCustomer') : t('customer.addCustomer')}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label={t('customer.customerName')}
                                value={formData.customer_name}
                                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                                fullWidth
                                required
                            />
                            <TextField
                                label={t('customer.phone')}
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label={t('customer.address')}
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            <TextField
                                label={t('customer.city')}
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Sort Order"
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>{t('customer.status')}</InputLabel>
                                <Select
                                    value={formData.is_active}
                                    onChange={(e) => handleInputChange('is_active', e.target.value)}
                                    label={t('customer.status')}
                                >
                                    <MenuItem value={true}>{t('customer.active')}</MenuItem>
                                    <MenuItem value={false}>{t('customer.inactive')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>
                            {t('customer.cancel')}
                        </Button>
                        <Button onClick={handleSave} variant="contained">
                            {t('customer.save')}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success/Error Messages */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess(null)}
                >
                    <Alert onClose={() => setSuccess(null)} severity="success">
                        {success}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                >
                    <Alert onClose={() => setError(null)} severity="error">
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default CustomerManagement;
