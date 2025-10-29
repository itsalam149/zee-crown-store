import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const { product_id, quantity } = await request.json();
        const supabase = createClient();

        if (!product_id || !quantity || quantity < 1) {
            return NextResponse.json({ error: 'Invalid product or quantity.' }, { status: 400 });
        }

        // Ensure user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch product
        const { data: product, error: productErr } = await supabase
            .from('products')
            .select('*')
            .eq('id', product_id)
            .single();
        if (productErr || !product) {
            return NextResponse.json({ error: productErr?.message || 'Product not found' }, { status: 404 });
        }

        // Fetch default address (or first)
        const { data: addresses, error: addrErr } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });
        if (addrErr) {
            return NextResponse.json({ error: addrErr.message }, { status: 400 });
        }
        const address = (addresses && addresses.length > 0) ? (addresses.find(a => a.is_default) || addresses[0]) : null;
        if (!address) {
            return NextResponse.json({ error: 'No address found. Please add a shipping address.' }, { status: 400 });
        }

        // Compute subtotal
        const subtotal = (product.price || 0) * quantity;

        // Compute shipping fee similar to checkout rules
        let shippingFee = 40;
        let threshold = 500;
        try {
            const { data: rules } = await supabase
                .from('shipping_rules')
                .select('charge, min_order_value, is_active')
                .eq('is_active', true)
                .order('min_order_value', { ascending: false });
            if (rules && rules.length > 0) {
                const freeRule = rules.find((r: any) => r.charge === 0);
                if (freeRule) threshold = freeRule.min_order_value;
                const applicableRule = rules.find((r: any) => subtotal >= r.min_order_value);
                shippingFee = applicableRule ? applicableRule.charge : (rules[rules.length - 1]?.charge ?? 40);
            }
        } catch (_) {
            // keep defaults
        }
        const total = subtotal >= threshold ? subtotal : subtotal + shippingFee;

        // Create order (COD by default for direct Buy Now)
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                shipping_address: address.id, // column is uuid pointing to addresses.id
                total_price: total,
                payment_method: 'COD',
                status: 'processing',
            })
            .select()
            .single();
        if (orderErr) {
            return NextResponse.json({ error: orderErr.message }, { status: 400 });
        }

        // Insert order item
        const { error: itemErr } = await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: product.id,
            quantity,
            price_at_purchase: product.price,
        });
        if (itemErr) {
            return NextResponse.json({ error: itemErr.message }, { status: 400 });
        }

        return NextResponse.json({ orderId: order.id });
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
    }
}


