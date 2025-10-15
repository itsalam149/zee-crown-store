"use client";

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
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(*))')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching orders:', error);
                    setOrders([]);
                } else if (data) {
                    setOrders(data as Order[]);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchOrders();
    }, [session, supabase, router]);

    // Loading state
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-10">
                <BackButton />
                <h1 className="text-3xl font-bold mb-6">My Orders</h1>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <OrderCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // No session
    if (!session) return null;

    // Empty orders
    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20">
                <BackButton />
                <div className="text-center bg-white rounded-lg shadow-md p-10">
                    <PackageOpen size={64} className="mx-auto text-gray-300" />
                    <h1 className="text-2xl font-bold mt-4">No Orders Found</h1>
                    <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
                    <Link
                        href="/"
                        className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // Orders list
    return (
        <div className="max-w-4xl mx-auto py-10">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            <div className="space-y-6">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}
