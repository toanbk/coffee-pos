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
    Divider,
    CardMedia,
    Paper,
    TextField,
    Snackbar,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoryService, productService, orderService } from '../services/api';
import type { Category, Product, OrderItem } from '../types';

const Order = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
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

    const formatPrice = (price: number) => {
        return `${price.toLocaleString('vi-VN')}đ`;
    };

    const calculateSubtotal = (item: OrderItem) => {
        return item.unit_price * item.quantity;
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;

        try {
            setIsPlacingOrder(true);
            setError(null);
            
            const response = await orderService.createOrder(cart);
            
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
        <Box sx={{ display: 'flex', height: '100vh', width: '100%' }}>
            {/* Categories Column - 15% */}
            <Box sx={{ 
                width: '15%', 
                borderRight: 1, 
                borderColor: 'divider',
                overflow: 'auto',
                p: 1,
                flexShrink: 0
            }}>
                <List>
                    {categories.map((category) => (
                        <ListItem 
                            key={category.id} 
                            disablePadding 
                            sx={{ mb: 2 }}
                        >
                            <Paper
                                elevation={1}
                                sx={{
                                    width: '100%',
                                    cursor: 'pointer',
                                    bgcolor: selectedCategory === category.id ? 'primary.main' : 'background.paper',
                                    '&:hover': {
                                        bgcolor: selectedCategory === category.id ? 'primary.main' : 'action.hover',
                                    },
                                }}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    p: 1,
                                    gap: 1
                                }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ 
                                            width: 40, 
                                            height: 40, 
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            flexShrink: 0
                                        }}
                                        image={category.image_url || '/placeholder-category.png'}
                                        alt={category.name}
                                    />
                                    <Typography 
                                        variant="subtitle2" 
                                        noWrap 
                                        sx={{ 
                                            flex: 1,
                                            textAlign: 'left',
                                            textTransform: 'uppercase',
                                            fontWeight: 500,
                                            color: selectedCategory === category.id ? 'white' : 'inherit'
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

            {/* Products Column - 45% */}
            <Box sx={{ 
                width: '45%', 
                overflow: 'auto', 
                p: 2,
                bgcolor: 'background.default',
                flexShrink: 0
            }}>
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2 
                }}>
                    {products.map((product) => (
                        <Card 
                            key={product.id}
                            sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 3,
                                },
                                transition: 'box-shadow 0.2s',
                                p: '5px'
                            }}
                            onClick={() => addToCart(product)}
                        >
                            <Box sx={{ display: 'flex', height: '100%' }}>
                                <CardMedia
                                    component="img"
                                    sx={{ 
                                        width: 120,
                                        objectFit: 'cover'
                                    }}
                                    image={product.image_url || '/placeholder-product.png'}
                                    alt={product.name}
                                />
                                <CardContent sx={{ flex: 1, p: 1.5 }}>
                                    <Typography variant="h6" noWrap>
                                        {product.name}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        color="primary"
                                        sx={{ mt: 1 }}
                                    >
                                        {formatPrice(product.price)}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                    ))}
                </Box>
            </Box>

            {/* Cart Column - 40% */}
            <Box sx={{ 
                width: '40%', 
                borderLeft: 1, 
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                <Box sx={{ 
                    p: 2, 
                    flex: 1,
                    overflow: 'auto'
                }}>
                    <Typography variant="h6" gutterBottom>
                        Current Order
                    </Typography>
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
                                    p: 2,
                                }}
                            >
                                <Box sx={{ 
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h6" noWrap sx={{ mb: 0.5 }}>
                                            {item.product_name}
                                        </Typography>
                                        <Typography variant="subtitle1" color="textSecondary" noWrap>
                                            {formatPrice(item.unit_price)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        bgcolor: 'background.default',
                                        borderRadius: 1,
                                        p: 1,
                                        minWidth: 180,
                                        justifyContent: 'center'
                                    }}>
                                        <IconButton
                                            size="large"
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
                                            <RemoveIcon />
                                        </IconButton>
                                        <TextField
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                                            inputProps={{
                                                min: 0,
                                                style: { 
                                                    textAlign: 'center',
                                                    padding: '8px',
                                                    width: '80px',
                                                    fontSize: '1.1rem'
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
                                            size="large"
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
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                    <Typography 
                                        variant="h6"
                                        sx={{ 
                                            fontWeight: 'bold',
                                            minWidth: 120,
                                            textAlign: 'right'
                                        }}
                                    >
                                        {formatPrice(calculateSubtotal(item))}
                                    </Typography>
                                    <IconButton
                                        size="large"
                                        onClick={() => removeFromCart(item.product_id)}
                                        sx={{ 
                                            '&:hover': {
                                                color: 'error.main',
                                            },
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 2 
                    }}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary">
                            {formatPrice(calculateTotal())}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={cart.length === 0 || isPlacingOrder}
                        size="large"
                        onClick={handlePlaceOrder}
                        sx={{ 
                            py: 1.5,
                            fontSize: '1.1rem'
                        }}
                    >
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </Button>
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