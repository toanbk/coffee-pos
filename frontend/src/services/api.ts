import axios from 'axios';
import type { Category, Product, Order, OrderItem } from '../types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
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
        const response = await api.post<LoginResponse>('/auth/token', {
            username,
            password,
        });
        return response.data;
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
        const response = await api.get<UserResponse>('/auth/me');
        return response.data;
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

export const orderService = {
    createOrder: async (items: OrderItem[]): Promise<{ order_id: number }> => {
        const response = await api.post('/orders', { items });
        return response.data;
    },
    getOrders: async (): Promise<Order[]> => {
        const response = await api.get<Order[]>('/orders');
        return response.data;
    },
    getOrder: async (orderId: number): Promise<Order> => {
        const response = await api.get<Order>(`/orders/${orderId}`);
        return response.data;
    },
    updateOrderStatus: async (orderId: number, status: string) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },
    // Report endpoints
    getOverviewReport: async () => {
        const response = await api.get('/reports/overview');
        return response.data;
    },
    getProductRevenueReport: async () => {
        const response = await api.get('/reports/product-revenue');
        return response.data;
    },
    getDailyRevenueReport: async () => {
        const response = await api.get('/reports/daily-revenue');
        return response.data;
    },
}; 