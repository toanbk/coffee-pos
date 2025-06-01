export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    image_url: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string;
}

export interface OrderItem {
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
}

export interface Order {
    id: number;
    user_id: number;
    status: string;
    total_amount: number;
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