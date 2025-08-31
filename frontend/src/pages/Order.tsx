import React from 'react';
import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    Box,
    IconButton,
    Button,
    CardMedia,
    Paper,
    TextField,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoryService, productService, orderService, paymentMethodService } from '../services/api';
import type { Category, Product, OrderItem, PaymentMethod } from '../types';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/format';

const Order: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        loadCategories();
        loadPaymentMethods();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadProducts(selectedCategory);
        }
    }, [selectedCategory]);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
            if (data.length > 0) {
                setSelectedCategory(data[0].id);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProducts = async (categoryId: number) => {
        try {
            const data = await productService.getProducts(categoryId);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const data = await paymentMethodService.getPaymentMethods();
            setPaymentMethods(data);
            if (data.length > 0) {
                setSelectedPaymentMethod(data[0].payment_method_code);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    };

    const addToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, {
                product_id: product.id,
                product_name: product.name,
                unit_price: product.price,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product_id === productId) {
                    const newQuantity = item.quantity + delta;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
                }
                return item;
            })
        );
    };

    const handleQuantityChange = (productId: number, newQuantity: string) => {
        // Allow empty string for clearing the field
        if (newQuantity === '') {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: 0 }
                        : item
                )
            );
            return;
        }

        // Remove leading zeros and parse the number
        const cleanQuantity = newQuantity.replace(/^0+/, '') || '0';
        const quantity = parseInt(cleanQuantity);
        
        if (!isNaN(quantity)) {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: Math.max(0, quantity) }
                        : item
                )
            );
        }
    };

    const calculateSubtotal = (item: OrderItem) => {
        return item.unit_price * item.quantity;
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        if (!selectedPaymentMethod) {
            setError('Please select a payment method');
            return;
        }

        try {
            setIsPlacingOrder(true);
            setError(null);
            
            const response = await orderService.createOrder(cart, selectedPaymentMethod);
            
            // Clear cart after successful order
            setCart([]);
            setSuccess(`Order #${response.order_id} placed successfully!`);
            
            // Optional: Reset category selection
            if (categories.length > 0) {
                setSelectedCategory(categories[0].id);
            }
        } catch (err) {
            setError('Failed to place order. Please try again.');
            console.error('Error placing order:', err);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header title={t('common.sale')} />
            <Box sx={{ 
                display: 'flex', 
                height: '100vh', 
                width: '100%',
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                {/* Categories Column */}
                <Box sx={{ 
                    width: isMobile ? '100%' : '15%', 
                    borderRight: isMobile ? 0 : 1,
                    borderBottom: isMobile ? 1 : 0,
                    borderColor: 'divider',
                    overflow: 'auto',
                    p: 1,
                    flexShrink: 0,
                    maxHeight: isMobile ? '200px' : 'none'
                }}>
                    <List sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'row' : 'column',
                        overflowX: isMobile ? 'auto' : 'visible',
                        pb: isMobile ? 1 : 0
                    }}>
                        {categories.map((category) => (
                            <ListItem 
                                key={category.id} 
                                disablePadding 
                                sx={{ 
                                    mb: isMobile ? 0 : 2,
                                    mr: isMobile ? 2 : 0,
                                    minWidth: isMobile ? 'auto' : '100%'
                                }}
                            >
                                <Paper
                                    sx={{
                                        width: '100%',
                                        cursor: 'pointer',
                                        bgcolor: selectedCategory === category.id ? 'primary.main' : 'background.paper',
                                        '&:hover': {
                                            bgcolor: selectedCategory === category.id ? 'primary.main' : 'action.hover',
                                        },
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 'none',
                                        whiteSpace: 'nowrap',
                                        px: 2,
                                        py: 1
                                    }}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1
                                    }}>
                                        <CardMedia
                                            component="img"
                                            sx={{ 
                                                width: isMobile ? 24 : 40, 
                                                height: isMobile ? 24 : 40, 
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                flexShrink: 0
                                            }}
                                            image={category.image_url || '/placeholder-category.png'}
                                            alt={category.name}
                                        />
                                        <Typography 
                                            noWrap
                                            sx={{
                                                textAlign: 'left',
                                                textTransform: 'uppercase',
                                                fontWeight: 500,
                                                color: selectedCategory === category.id ? 'white' : 'inherit',
                                                fontSize: isMobile ? '0.8rem' : '0.875rem'
                                            }}
                                        >
                                            {category.name}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                {/* Products Column */}
                <Box sx={{ 
                    width: isMobile ? '100%' : '45%', 
                    overflow: 'auto', 
                    p: isMobile ? 1 : 2,
                    bgcolor: 'background.default',
                    flexShrink: 0,
                    flex: 1
                }}>
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)', 
                        gap: isMobile ? 1 : 2 
                    }}>
                        {products.map((product) => (
                            <Card 
                                key={product.id}
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    transition: 'background-color 0.2s',
                                    p: isMobile ? '2px' : '5px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    boxShadow: 'none',
                                }}
                                onClick={() => addToCart(product)}
                            >
                                <Box sx={{ display: 'flex', height: '100%' }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            width: isMobile ? 80 : 120,
                                            objectFit: 'cover'
                                        }}
                                        image={product.image_url || '/placeholder-product.png'}
                                        alt={product.name}
                                    />
                                    <CardContent sx={{ 
                                        flex: 1, 
                                        p: isMobile ? 1 : 1.5,
                                        '&:last-child': {
                                            pb: isMobile ? 1 : 1.5
                                        }
                                    }}>
                                        <Typography 
                                            variant="h6" 
                                            noWrap
                                            sx={{
                                                fontSize: isMobile ? '0.9rem' : '1.25rem',
                                                mb: isMobile ? 0.5 : 1
                                            }}
                                        >
                                            {product.name}
                                        </Typography>
                                        <Typography 
                                            variant="h6" 
                                            color="primary"
                                            sx={{ 
                                                mt: isMobile ? 0 : 1,
                                                fontSize: isMobile ? '0.9rem' : '1.25rem'
                                            }}
                                        >
                                            {formatPrice(product.price)}
                                        </Typography>
                                    </CardContent>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Box>

                {/* Cart Column */}
                <Box sx={{ 
                    width: isMobile ? '100%' : '40%', 
                    borderLeft: isMobile ? 0 : 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    position: isMobile ? 'fixed' : 'relative',
                    bottom: isMobile ? 0 : 'auto',
                    left: isMobile ? 0 : 'auto',
                    right: isMobile ? 0 : 'auto',
                    bgcolor: 'background.paper',
                    zIndex: isMobile ? 1000 : 'auto',
                    height: isMobile ? 'auto' : 'calc(100vh - 64px)',
                    maxHeight: isMobile ? '60vh' : 'none',
                    borderTop: isMobile ? 1 : 0,
                }}>
                    <Box sx={{ 
                        p: 2, 
                        flex: 1,
                        overflow: 'auto',
                        pb: isMobile ? '140px' : 10,
                    }}>
                        <Typography variant="h6" gutterBottom>
                            {t('common.currentOrder')}
                        </Typography>
                        
                        {/* Payment Method Selection */}
                        <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
                            <FormLabel component="legend" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                {t('common.paymentMethod')}
                            </FormLabel>
                            <RadioGroup
                                value={selectedPaymentMethod}
                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                sx={{ flexDirection: isMobile ? 'column' : 'row' }}
                            >
                                {paymentMethods.map((method) => (
                                    <FormControlLabel
                                        key={method.id}
                                        value={method.payment_method_code}
                                        control={<Radio size={isMobile ? "small" : "medium"} />}
                                        label={method.name}
                                        sx={{ 
                                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                                            mr: isMobile ? 0 : 2
                                        }}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <List>
                            {cart.map((item) => (
                                <ListItem
                                    key={item.product_id}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        mb: 2,
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                        p: isMobile ? 1 : 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ 
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        flexDirection: isMobile ? 'row' : 'row'
                                    }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="h6" noWrap sx={{ mb: 0.5, fontSize: isMobile ? '1rem' : '1.25rem' }}>
                                                {item.product_name}
                                            </Typography>
                                            {!isMobile && (
                                                <Typography variant="subtitle1" color="textSecondary" noWrap>
                                                    {formatPrice(item.unit_price)}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            bgcolor: 'background.default',
                                            borderRadius: 1,
                                            p: isMobile ? 0.5 : 1,
                                            minWidth: isMobile ? 120 : 180,
                                            justifyContent: 'center'
                                        }}>
                                            <IconButton
                                                size={isMobile ? "small" : "large"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(item.product_id, -1);
                                                }}
                                                sx={{ 
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                }}
                                            >
                                                <RemoveIcon fontSize={isMobile ? "small" : "medium"} />
                                            </IconButton>
                                            <TextField
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                                                inputProps={{
                                                    min: 0,
                                                    style: { 
                                                        textAlign: 'center',
                                                        padding: isMobile ? '4px' : '8px',
                                                        width: isMobile ? '40px' : '80px',
                                                        fontSize: isMobile ? '0.9rem' : '1.1rem'
                                                    }
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            border: 'none',
                                                        },
                                                        '&:hover fieldset': {
                                                            border: 'none',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            border: 'none',
                                                        },
                                                    },
                                                }}
                                            />
                                            <IconButton
                                                size={isMobile ? "small" : "large"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updateQuantity(item.product_id, 1);
                                                }}
                                                sx={{ 
                                                    '&:hover': {
                                                        bgcolor: 'action.hover',
                                                    },
                                                }}
                                            >
                                                <AddIcon fontSize={isMobile ? "small" : "medium"} />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: isMobile ? 'auto' : 'auto',
                                            minWidth: isMobile ? 80 : 120,
                                        }}>
                                            <Typography 
                                                variant="h6"
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    textAlign: 'right',
                                                    fontSize: isMobile ? '1rem' : '1.25rem'
                                                }}
                                            >
                                                {formatPrice(calculateSubtotal(item))}
                                            </Typography>
                                            <IconButton
                                                size={isMobile ? "small" : "large"}
                                                onClick={() => removeFromCart(item.product_id)}
                                                sx={{ 
                                                    '&:hover': {
                                                        color: 'error.main',
                                                    },
                                                }}
                                            >
                                                <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box sx={{ 
                        p: 2, 
                        borderTop: 1, 
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        position: isMobile ? 'fixed' : 'relative',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        width: isMobile ? '100%' : 'auto',
                        zIndex: 1001
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mb: 2 
                        }}>
                            <Typography variant="h6">{t('common.total')}:</Typography>
                            <Typography variant="h6" color="primary">
                                {formatPrice(calculateTotal())}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={cart.length === 0 || isPlacingOrder || !selectedPaymentMethod}
                            size="large"
                            onClick={handlePlaceOrder}
                            sx={{ 
                                py: 1.5,
                                fontSize: '1.1rem'
                            }}
                        >
                            {isPlacingOrder ? t('common.placingOrder') : t('common.placeOrder')}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={!!error || !!success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={error ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {error || success}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Order; 