import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { address, cartItems, total, payment } = await request.json();
        const supabase = createClient();

        // Get current user from server-side auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            return NextResponse.json({ error: 'No items to order.' }, { status: 400 });
        }

        // Normalize address payload (store as JSON or flattened fields as your schema requires)
        const shippingAddress = address || null;
        const paymentMethod = payment?.method === 'ONLINE' ? 'Paid' : 'COD';

        // Create order
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert([{
                user_id: user.id,
                shipping_address: shippingAddress?.id || null, // column is uuid referencing addresses.id
                total_price: total,
                payment_method: paymentMethod,
                status: paymentMethod === 'Paid' ? 'paid' : 'processing',
            }])
            .select()
            .single();

        if (orderErr) {
            return NextResponse.json({ error: orderErr.message }, { status: 400 });
        }

        // Insert order items
        const orderItems = cartItems.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: item.products?.price ?? 0,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) {
            return NextResponse.json({ error: itemsErr.message }, { status: 400 });
        }

        // Optional: clear cart when not in Buy-Now you can add a flag if needed

        return NextResponse.json({ orderId: order.id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
    }
}