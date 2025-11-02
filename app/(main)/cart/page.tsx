// app/(main)/cart/page.tsx
"use client";

import { createClient } from '@/lib/supabase-client';
import { CartItem } from '@/lib/types';
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

// UI & Icon Imports
import CartCard from '@/components/cart/CartCard';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ShoppingCart, Loader2, ArrowRight, PackageX, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- A simpler progress bar ---
const FreeShippingBar = ({ subtotal, threshold }: { subtotal: number; threshold: number }) => {
    if (!threshold || subtotal <= 0) return null;

    const remainingAmount = threshold - subtotal;
    const progressPercentage = Math.min((subtotal / threshold) * 100, 100);
    const isFreeShipping = remainingAmount <= 0;

    if (isFreeShipping) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 mb-6 text-center"
            >
                <p className="font-semibold text-green-600">🎉 You've unlocked FREE delivery! 🎉</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
        >
            <p className="text-center text-sm md:text-base font-medium text-dark-gray mb-2">
                Add <span className="font-bold text-primary">₹{remainingAmount.toFixed(2)}</span> more to get FREE delivery!
            </p>
            <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </motion.div>
    );
};

// --- A simpler loading state ---
const LoadingState = () => (
    <div className="flex flex-col justify-center items-center h-[60vh] text-center">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
        <p className="text-xl font-semibold text-gray-700">Loading Your Cart...</p>
    </div>
);

// --- A simpler empty state ---
const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 md:py-24 px-4 flex flex-col items-center"
    >
        <div className="bg-gray-200 p-6 rounded-full mb-6">
            <PackageX strokeWidth={1.5} className="h-16 w-16 md:h-20 md:w-20 text-gray-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-3">
            Your Cart is Empty
        </h2>
        <p className="mt-3 text-base md:text-lg text-gray-600 max-w-md mx-auto">
            Looks like you haven't added anything yet. Let's find something for you!
        </p>
        <Button asChild className="mt-8 px-8 py-3 text-base rounded-xl">
            <Link href="/" className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Start Shopping
            </Link>
        </Button>
    </motion.div>
);

// --- MAIN CART PAGE COMPONENT ---
export default function CartPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [shippingFee, setShippingFee] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);

    const fetchCartItems = useCallback(async () => {
        let userId = session?.user?.id;
        if (!userId) {
            const { data: { session: liveSession } } = await supabase.auth.getSession();
            userId = liveSession?.user?.id;
        }
        if (!userId) {
            router.push('/login?redirect=' + encodeURIComponent('/cart'));
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('cart_items')
            .select('id, quantity, products(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) {
            toast.error('Could not fetch your cart.');
            setCartItems([]);
        } else {
            setCartItems((data || []) as unknown as CartItem[]);
        }
        setLoading(false);
    }, [session, supabase, router]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const subtotal = useMemo(() =>
        cartItems.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0),
        [cartItems]
    );

    useEffect(() => {
        const fetchShippingRules = async () => {
            const { data, error } = await supabase
                .from('shipping_rules')
                .select('min_order_value, charge')
                .eq('is_active', true)
                .order('min_order_value', { ascending: false });

            let currentThreshold = 500;
            let currentFee = 40;

            if (!error && data && data.length > 0) {
                const freeRule = data.find(rule => rule.charge === 0);
                if (freeRule) currentThreshold = freeRule.min_order_value;
                const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                currentFee = applicableRule ? applicableRule.charge : (data[data.length - 1]?.charge ?? 40);
            }

            setFreeShippingThreshold(currentThreshold);
            setShippingFee(subtotal > 0 && subtotal < currentThreshold ? currentFee : 0);
        };
        fetchShippingRules();
    }, [subtotal, supabase]);

    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (!session?.user) return router.push('/login');
        if (newQuantity < 1) return removeItem(cartItemId);

        const originalItems = cartItems.map(item => ({ ...item }));
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        const { error } = await supabase.from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', cartItemId)
            .eq('user_id', session.user.id);

        if (error) {
            toast.error('Failed to update cart.');
            setCartItems(originalItems);
        }
    };

    const removeItem = async (cartItemId: string) => {
        if (!session?.user) return router.push('/login');

        const originalItems = cartItems.map(item => ({ ...item }));
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));

        const { error } = await supabase.from('cart_items')
            .delete()
            .eq('id', cartItemId)
            .eq('user_id', session.user.id);

        if (error) {
            toast.error('Failed to remove item.');
            setCartItems(originalItems);
        }
    };

    const total = subtotal + shippingFee;

    return (
        <motion.div
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/*
              FIX: This div is now responsive.
              The pt-16 is REMOVED to fix the gap.
            */}
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <motion.div
                    className="flex items-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <BackButton />
                    <h1 className="text-3xl md:text-4xl font-bold ml-4 text-dark-gray">
                        My Cart
                    </h1>
                    {!loading && cartItems.length > 0 && (
                        <span className="ml-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                            {cartItems.length}
                        </span>
                    )}
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <LoadingState key="loading" />
                    ) : cartItems.length === 0 ? (
                        <EmptyState key="empty" />
                    ) : (
                        <motion.div
                            key="content"
                            // This is the responsive layout:
                            // - Mobile: flex-col (stacks items on top of summary)
                            // - Desktop: lg:flex-row (items on left, summary on right)
                            className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {/* Cart Items */}
                            <div className="flex-grow space-y-6">
                                <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />
                                <AnimatePresence>
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                                        >
                                            <CartCard
                                                item={item}
                                                onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                                                onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                                                onRemove={() => removeItem(item.id)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Order Summary */}
                            <div className="w-full lg:w-96 lg:sticky lg:top-24">
                                <motion.div
                                    className="glass-card p-6 rounded-xl"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h2 className="text-2xl font-bold mb-5 text-dark-gray">
                                        Order Summary
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-gray-600">
                                            <p>Subtotal</p>
                                            <p className="font-semibold text-dark-gray">₹{subtotal.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-600">
                                            <p>Shipping Fee</p>
                                            <p className={cn("font-semibold", shippingFee === 0 ? "text-green-600" : "text-dark-gray")}>
                                                {shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE'}
                                            </p>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="flex justify-between items-center text-dark-gray">
                                            <p className="text-lg font-bold">Total</p>
                                            <p className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/checkout')}
                                        className="w-full mt-6"
                                        disabled={loading || subtotal === 0}
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="h-5 w-5 ml-2" />
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}