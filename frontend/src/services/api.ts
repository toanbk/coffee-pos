import axios from 'axios';
import type { Category, Product, Order, OrderItem, PaymentMethod } from '../types';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

interface LoginResponse {
    access_token: string;
    token_type: string;
    role: number;
    redirect_to: string;
}

interface UserResponse {
    id: number;
    username: string;
    email: string;
    role: number;
    is_active: boolean;
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await api.post<LoginResponse>('/auth/token', {
                username,
                password,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                throw new Error('Invalid username or password');
            }
            throw error;
        }
    },
    register: async (username: string, email: string, password: string): Promise<UserResponse> => {
        const response = await api.post<UserResponse>('/auth/register', {
            username,
            email,
            password,
        });
        return response.data;
    },
    getCurrentUser: async (): Promise<UserResponse> => {
        try {
            const response = await api.get<UserResponse>('/auth/me');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem('access_token');
                throw new Error('Session expired. Please login again.');
            }
            throw error;
        }
    },
};

export const categoryService = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },
};

export const productService = {
    getProducts: async (categoryId?: number): Promise<Product[]> => {
        const params = categoryId ? { category_id: categoryId } : {};
        const response = await api.get<Product[]>('/products', { params });
        return response.data;
    },
};

export const paymentMethodService = {
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        const response = await api.get<PaymentMethod[]>('/payment-methods');
        return response.data;
    },
};

export const customerService = {
    getCustomers: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },
    getActiveCustomers: async (): Promise<Customer[]> => {
        const response = await api.get<Customer[]>('/customers/active');
        return response.data;
    },
    createCustomer: async (customerData: Omit<Customer, 'id' | 'created_at'>): Promise<{ id: number }> => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },
    updateCustomer: async (id: number, customerData: Partial<Customer>): Promise<void> => {
        await api.put(`/customers/${id}`, customerData);
    },
    deleteCustomer: async (id: number): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },
    activateCustomer: async (id: number): Promise<void> => {
        await api.put(`/customers/${id}/activate`);
    },
};

export const orderService = {
    createOrder: async (items: OrderItem[], paymentMethodCode?: string, customerId?: number): Promise<{ order_id: number }> => {
        const response = await api.post('/orders', { 
            items,
            payment_method_code: paymentMethodCode,
            customer_id: customerId
        });
        return response.data;
    },
    getOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/orders');
        return response.data;
    },
    getOrder: async (orderId: number): Promise<Order> => {
        const response = await api.get<Order>(`/orders/view/${orderId}`);
        return response.data;
    },
    updateOrderStatus: async (orderId: number, status: string) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },
    // Report endpoints
    getOverviewReport: async () => {
        try {
            const response = await api.get('/reports/overview');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new Error('You do not have permission to access reports');
            }
            throw error;
        }
    },
    getProductRevenueReport: async () => {
        try {
            const response = await api.get('/reports/product-revenue');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new Error('You do not have permission to access reports');
            }
            throw error;
        }
    },
    getDailyRevenueReport: async () => {
        try {
            const response = await api.get('/reports/daily-revenue');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new Error('You do not have permission to access reports');
            }
            throw error;
        }
    },
    getMonthlyRevenueReport: async () => {
        try {
            const response = await api.get('/reports/monthly-revenue');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new Error('You do not have permission to access reports');
            }
            throw error;
        }
    },
    getOrderHistory: async (dateFilter: string) => {
        const response = await api.get('/orders/history', {
            params: { date_filter: dateFilter }
        });
        return response.data;
    },
    deleteOrder: async (orderId: number) => {
        const response = await api.delete(`/orders/delete/${orderId}`);
        return response.data;
    },
};