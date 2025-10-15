import { createClient } from '@/lib/supabase-server'; // Use the server client here
import OrderDetailView from '@/components/orders/OrderDetailView';
import { notFound } from 'next/navigation';
import { Order } from '@/lib/types';

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const supabase = createClient();

    // Updated Query: Fetch order AND the related address details
    const { data: order } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(*, products(*)),
            shipping_address:addresses(*)
        `)
        .eq('id', params.orderId)
        .single();

    if (!order) {
        notFound();
    }

    return <OrderDetailView order={order as unknown as Order} />;
}