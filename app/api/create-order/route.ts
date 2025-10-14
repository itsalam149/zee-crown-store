import { createClient } from '@/lib/supabase-client';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { address, cartItems, total } = await request.json();
    const supabase = createClient();

    // This is a simplified version. In a real app, you'd have more robust logic.
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            shipping_address: address,
            total_price: total,
            payment_method: 'COD', // Assuming COD for simplicity
            status: 'processing',
            // For guest checkout, you might generate and store a session_id
        }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const orderItems = cartItems.map((item: any) => ({
        order_id: data.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Here you would typically clear the user's cart
    // For a guest user, this might involve clearing localStorage or a DB table entry

    return NextResponse.json({ orderId: data.id });
}