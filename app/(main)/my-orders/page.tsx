'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Order } from '@/lib/types';
import OrderCard from '@/components/orders/OrderCard';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

export default function MyOrdersPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        const fetchOrders = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*))')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (data) setOrders(data);
            setLoading(false);
        };
        if (session) fetchOrders();
    }, [session, supabase, router]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <BackButton />
                <h1 className="text-3xl font-bold mb-6">My Orders</h1>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    if (!session) return null;

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <BackButton />
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <PackageOpen size={64} className="mx-auto text-gray-300" />
                    <h1 className="text-2xl font-bold mt-4">No Orders Found</h1>
                    <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
                    <Link href="/" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            <div className="space-y-6">
                {orders.map((order) => (<OrderCard key={order.id} order={order} />))}
            </div>
        </div>
    );
}