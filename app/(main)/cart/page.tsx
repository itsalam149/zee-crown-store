"use client";

import { createClient } from '@/lib/supabase-client';
import { CartItem, ShippingRule } from '@/lib/types'; // Assuming you have these types defined
import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// UI & Icon Imports
import CartCard from '@/components/cart/CartCard'; // Assuming this component exists
import BackButton from '@/components/ui/BackButton'; // Assuming this component exists
import { ShoppingCart, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming you use shadcn/ui or similar

// --- UI SUB-COMPONENTS ---    

/**
 * @description A progress bar and message to encourage users to get free shipping.
 */
const FreeShippingBar = ({ subtotal, threshold }: { subtotal: number; threshold: number }) => {
    if (!threshold || subtotal < 0) {
        return null;
    }

    const remainingAmount = threshold - subtotal;
    const progressPercentage = Math.min((subtotal / threshold) * 100, 100);

    if (remainingAmount > 0) {
        return (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mx-4 mb-4">
                <p className="text-center text-sm">
                    Add <span className="font-bold">₹{remainingAmount.toFixed(2)}</span> more for FREE delivery!
                </p>
                <div className="w-full bg-blue-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mx-4 mb-4">
            <p className="text-center font-semibold text-sm">🎉 Yay! You've got FREE delivery!</p>
        </div>
    );
};

/**
 * @description The summary section with subtotal, shipping, and total, with a checkout button.
 */
const CheckoutSummary = ({ subtotal, shippingFee, onCheckout }: { subtotal: number; shippingFee: number; onCheckout: () => void; }) => {
    const total = subtotal + shippingFee;

    const Row = ({ title, value, isTotal = false }: { title: string; value: string; isTotal?: boolean; }) => (
        <div className="flex justify-between items-center">
            <p className={`text-base ${isTotal ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                {title}
            </p>
            <p className={`text-lg font-semibold ${isTotal ? 'text-primary' : 'text-gray-800'}`}>
                {value}
            </p>
        </div>
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 pt-5 rounded-t-2xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] 
                        lg:relative lg:rounded-lg lg:shadow-md lg:w-96 lg:sticky lg:top-24">
            <div className="space-y-3">
                <Row title="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                <Row title="Shipping Fee" value={shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE'} />
                <hr className="my-3" />
                <Row title="Total" value={`₹${total.toFixed(2)}`} isTotal />
            </div>
            <Button onClick={onCheckout} className="w-full mt-6" size="lg">
                Proceed to Checkout
            </Button>
        </div>
    );
};

/**
 * @description UI states for loading, empty cart, and errors.
 */
const LoadingState = () => (
    <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
);

const EmptyState = () => (
    <div className="text-center py-20 px-4">
        <div className="bg-gray-100 w-28 h-28 rounded-full inline-flex items-center justify-center">
            <ShoppingCart strokeWidth={1.5} className="h-14 w-14 text-gray-400" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
        <Button asChild className="mt-8">
            <Link href="/">Start Shopping</Link>
        </Button>
    </div>
);


// --- MAIN CART PAGE COMPONENT ---
export default function CartPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [shippingFee, setShippingFee] = useState(0);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);

    // Fetch cart items logic
    const fetchCartItems = useCallback(async () => {
        if (!session?.user) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from('cart_items')
            .select('id, quantity, products(*)')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching cart items:', error);
            // Handle error UI if needed
        } else {
            setCartItems(data as CartItem[] || []);
        }
        setLoading(false);
    }, [session, supabase]);

    // Initial fetch on session load
    useEffect(() => {
        if (!session && useAuthStore.getState().isRestored) {
            router.push('/login');
        } else if (session) {
            fetchCartItems();
        }
    }, [session, fetchCartItems, router]);

    // Calculate subtotal
    const subtotal = useMemo(() =>
        cartItems.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0),
        [cartItems]
    );

    // Fetch shipping rules and calculate fee based on subtotal
    useEffect(() => {
        const fetchShippingRules = async () => {
            const { data, error } = await supabase
                .from('shipping_rules')
                .select('min_order_value, charge')
                .eq('is_active', true)
                .order('min_order_value', { ascending: false });

            if (error || !data) {
                // Fallback logic if fetching rules fails
                const defaultThreshold = 499;
                setFreeShippingThreshold(defaultThreshold);
                setShippingFee(subtotal > 0 && subtotal < defaultThreshold ? 40 : 0);
                return;
            }

            const freeRule = data.find(rule => rule.charge === 0);
            setFreeShippingThreshold(freeRule?.min_order_value || 0);

            if (subtotal > 0) {
                const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                setShippingFee(applicableRule ? applicableRule.charge : 0);
            } else {
                setShippingFee(0);
            }
        };

        fetchShippingRules();
    }, [subtotal, supabase]);

    // Cart modification handlers with optimistic updates
    const updateQuantity = async (cartItemId: string, newQuantity: number) => {
        if (newQuantity < 1) return removeItem(cartItemId);

        const originalItems = [...cartItems];
        setCartItems(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));

        const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartItemId);
        if (error) {
            console.error('Failed to update quantity:', error);
            setCartItems(originalItems); // Revert on error
        }
    };

    const removeItem = async (cartItemId: string) => {
        const originalItems = [...cartItems];
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));

        const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
        if (error) {
            console.error('Failed to remove item:', error);
            setCartItems(originalItems); // Revert on error
        }
    };

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <div className="container mx-auto max-w-6xl p-4">
                <div className="flex items-center mb-6">
                    <BackButton />
                    <h1 className="text-2xl md:text-3xl font-bold ml-4">My Cart</h1>
                </div>

                {loading ? (
                    <LoadingState />
                ) : cartItems.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                        {/* Main content */}
                        <div className="flex-grow pb-40 lg:pb-0">
                            <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <CartCard
                                        key={item.id}
                                        item={item}
                                    // onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                                    // onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                                    // onRemove={() => removeItem(item.id)}
                                    />
                                ))}
                            </div>
                        </div>
                        {/* Summary */}
                        <CheckoutSummary
                            subtotal={subtotal}
                            shippingFee={shippingFee}
                            onCheckout={() => router.push('/checkout')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}