export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category_id: number;
    image_url?: string;
}

export interface PaymentMethod {
    id: number;
    payment_method_code: string;
    name: string;
    description?: string;
}

export interface OrderItem {
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
}

export interface Order {
    id: number;
    total_amount: number;
    payment_method_code?: string;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface CartItem extends Product {
    quantity: number;
} 