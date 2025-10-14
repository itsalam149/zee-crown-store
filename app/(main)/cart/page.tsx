'use client';

import { createClient } from '@/lib/supabase-client';
import { CartItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import CartCard from '@/components/cart/CartCard';
import CartSummary from '@/components/cart/CartSummary';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

export default function CartPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        const fetchCartItems = async () => {
            const { data } = await supabase
                .from('cart_items')
                .select('*, products(*)')
                .eq('user_id', session.user.id)
                .order('created_at');
            if (data) setCartItems(data as any);
            setLoading(false);
        };
        if (session) fetchCartItems();
    }, [session, supabase, router]);

    if (loading) return (
        <div>
            <BackButton />
            <div className="text-center py-10">Loading your cart...</div>
        </div>
    );

    if (!session) return null;

    if (cartItems.length === 0) {
        return (
            <div>
                <BackButton />
                <div className="text-center py-20">
                    <ShoppingCart size={64} className="mx-auto text-gray-300" />
                    <h1 className="text-2xl font-bold mt-4">Your Cart is Empty</h1>
                    <p className="text-gray-500 mt-2">Looks like you haven't added anything yet.</p>
                    <Link href="/" className="mt-6 inline-block bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity">
                        Start Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h1 className="text-3xl font-bold">Your Cart</h1>
                    {cartItems.map(item => (<CartCard key={item.id} item={item} />))}
                </div>
                <div className="lg:col-span-1">
                    <CartSummary items={cartItems} />
                </div>
            </div>
        </div>
    );
}