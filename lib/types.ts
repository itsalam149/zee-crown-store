export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    mrp?: number;
}

export interface Banner {
    id: string;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    category: string;
}

export interface CartItem {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    products: Product;
}

export interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_price: number;
    shipping_address: string;
    payment_method: 'COD' | 'Paid';
    order_items: OrderItem[];
}

export interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
        id: string;
        name: string;
        image_url: string;
        category: string;
    };
}

export interface Address {
    id: string;
    user_id: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    house_no?: string;
    mobile_number?: string;
    landmark?: string;
}
