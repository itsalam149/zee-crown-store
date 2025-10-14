import { createClient } from '@/lib/supabase-client';
import OrderDetailView from '@/components/orders/OrderDetailView';
import { notFound } from 'next/navigation';

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
    const supabase = createClient();
    const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', params.orderId)
        .single();

    if (!order) {
        notFound();
    }

    return <OrderDetailView order={order} />;
}