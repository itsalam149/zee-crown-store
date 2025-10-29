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
import { ShoppingCart, Loader2, ArrowRight, PackageX, Truck, Sparkles, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- ANIMATION VARIANTS ---
const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.4,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    exit: {
        opacity: 0,
        x: 50,
        scale: 0.9,
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

const summaryVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2
        }
    }
};

// --- UI SUB-COMPONENTS ---

/**
 * @description Enhanced progress bar with smooth animations and celebratory effects
 */
const FreeShippingBar = ({ subtotal, threshold }: { subtotal: number; threshold: number }) => {
    if (!threshold || subtotal <= 0) {
        return null;
    }

    const remainingAmount = threshold - subtotal;
    const progressPercentage = Math.min((subtotal / threshold) * 100, 100);
    const isFreeShipping = remainingAmount <= 0;

    if (!isFreeShipping) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring" }}
                className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-4 md:p-5 mb-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
                {/* Animated background gradient */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                        x: ["-100%", "100%"]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Truck className="h-5 w-5 text-blue-600 animate-bounce" />
                        <p className="text-center text-sm md:text-base font-medium text-blue-900">
                            You're <span className="font-bold text-blue-600">₹{remainingAmount.toFixed(2)}</span> away from FREE delivery!
                        </p>
                    </div>

                    <div className="relative w-full bg-blue-100 rounded-full h-3 overflow-hidden shadow-inner">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        {/* Shimmer effect on progress bar */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{
                                x: ["-100%", "100%"]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-300 rounded-2xl p-4 md:p-5 mb-6 overflow-hidden shadow-md"
        >
            {/* Confetti-like particles */}
            <motion.div
                className="absolute inset-0"
                initial="hidden"
                animate="visible"
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                    />
                ))}
            </motion.div>

            <motion.div
                className="relative z-10 flex items-center justify-center gap-2"
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Gift className="h-6 w-6 text-green-600" />
                <p className="text-center font-bold text-base md:text-lg text-green-800">
                    🎉 Congratulations! You've unlocked FREE delivery! 🎉
                </p>
                <Sparkles className="h-6 w-6 text-green-600" />
            </motion.div>
        </motion.div>
    );
};

/**
 * @description Enhanced checkout summary with smooth animations
 */
const CheckoutSummary = ({
    subtotal,
    shippingFee,
    onCheckout,
    isLoading
}: {
    subtotal: number;
    shippingFee: number;
    onCheckout: () => void;
    isLoading: boolean;
}) => {
    const total = subtotal + shippingFee;
    const [isHovered, setIsHovered] = useState(false);

    const Row = ({
        title,
        value,
        isTotal = false,
        highlight = false
    }: {
        title: string;
        value: string;
        isTotal?: boolean;
        highlight?: boolean;
    }) => (
        <motion.div
            className="flex justify-between items-center"
            whileHover={{ x: 2 }}
            transition={{ duration: 0.2 }}
        >
            <p className={cn(
                "text-sm md:text-base",
                isTotal ? 'font-bold text-gray-800' : 'text-gray-600',
                highlight && 'text-green-600 font-semibold'
            )}>
                {title}
            </p>
            <p className={cn(
                "font-semibold",
                isTotal ? 'text-xl md:text-2xl text-primary' : 'text-base md:text-lg text-gray-800',
                highlight && 'text-green-600'
            )}>
                {value}
            </p>
        </motion.div>
    );

    return (
        <motion.div
            variants={summaryVariants}
            initial="hidden"
            animate="visible"
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 pt-6 border-t-2 border-gray-200 shadow-2xl
                       md:border-none md:relative md:rounded-2xl md:shadow-xl md:w-80 lg:w-96 md:sticky md:top-24 md:p-6 md:z-10
                       md:bg-white md:backdrop-blur-none"
        >
            {/* Decorative gradient at top */}
            <div className="hidden md:block absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary rounded-t-2xl" />

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-xl md:text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Order Summary
                </h2>
            </motion.div>

            <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.4
                        }
                    }
                }}
            >
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                    <Row title="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                    <Row
                        title="Shipping Fee"
                        value={shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'FREE'}
                        highlight={shippingFee === 0 && subtotal > 0}
                    />
                </motion.div>

                <motion.hr
                    className="my-4 border-gray-200"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                />

                <motion.div
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                    animate={{
                        scale: [1, 1.02, 1],
                    }}
                    transition={{
                        scale: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }
                    }}
                >
                    <Row title="Total" value={`₹${total.toFixed(2)}`} isTotal />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Button
                    onClick={onCheckout}
                    className="w-full mt-6 flex items-center justify-center gap-2 text-base md:text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    disabled={isLoading || subtotal === 0}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Button shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                            x: isHovered ? ["-100%", "100%"] : "-100%"
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeInOut"
                        }}
                    />

                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span className="relative z-10">Proceed to Checkout</span>
                            <motion.div
                                animate={{ x: isHovered ? 5 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowRight className="h-5 w-5 relative z-10" />
                            </motion.div>
                        </>
                    )}
                </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="hidden md:flex items-center justify-center gap-4 mt-6 text-xs text-gray-500"
            >
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Secure Checkout
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    Fast Delivery
                </span>
            </motion.div>
        </motion.div>
    );
};

/**
 * @description Enhanced loading state with smooth animations
 */
const LoadingState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col justify-center items-center h-[60vh] text-center"
    >
        <motion.div
            animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
            }}
            transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
        >
            <Loader2 className="h-16 w-16 text-primary mb-6" />
        </motion.div>
        <motion.p
            className="text-lg md:text-xl font-semibold text-gray-700"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            Loading Your Cart...
        </motion.p>
        <motion.p
            className="text-sm text-gray-500 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            Please wait a moment
        </motion.p>
    </motion.div>
);

/**
 * @description Enhanced empty state with engaging animations
 */
const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center py-16 md:py-24 px-4"
    >
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-br from-gray-100 to-gray-200 w-32 h-32 md:w-40 md:h-40 rounded-full inline-flex items-center justify-center mb-8 shadow-lg"
        >
            <motion.div
                animate={{
                    rotate: [0, 10, -10, 0],
                    y: [0, -5, 0]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <PackageX strokeWidth={1.5} className="h-16 w-16 md:h-20 md:w-20 text-gray-400" />
            </motion.div>
        </motion.div>

        <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            Your Cart is Empty
        </motion.h2>

        <motion.p
            className="mt-3 text-base md:text-lg text-gray-600 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            Looks like you haven't added anything yet. Let's find something amazing for you!
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Button asChild className="mt-8 px-8 py-4 text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/" className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Start Shopping
                </Link>
            </Button>
        </motion.div>

        {/* Floating decorative elements */}
        <div className="relative mt-12 h-20">
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-primary/20 rounded-full"
                    style={{
                        left: `${30 + i * 20}%`,
                        top: '50%',
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
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

    // Fetch cart items
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
            console.error('Error fetching cart items:', error);
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

    // Calculate subtotal
    const subtotal = useMemo(() =>
        cartItems.reduce((sum, item) => sum + ((item.products?.price || 0) * item.quantity), 0),
        [cartItems]
    );

    // Fetch shipping rules
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
                if (freeRule) {
                    currentThreshold = freeRule.min_order_value;
                }
                const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                currentFee = applicableRule ? applicableRule.charge : (data[data.length - 1]?.charge ?? 40);
            }

            setFreeShippingThreshold(currentThreshold);
            setShippingFee(subtotal > 0 && subtotal < currentThreshold ? currentFee : 0);
        };

        fetchShippingRules();
    }, [subtotal, supabase]);

    // Cart modification handlers
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
            console.error('Failed to update quantity:', error);
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
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item.');
            setCartItems(originalItems);
        }
    };

    return (
        <motion.div
            className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto max-w-7xl px-4 py-6 md:py-10 lg:px-6">
                <motion.div
                    className="flex items-center mb-8 md:mb-10"
                    variants={headerVariants}
                >
                    <BackButton />
                    <h1 className="text-3xl md:text-4xl font-bold ml-4 text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        My Cart
                    </h1>
                    {!loading && cartItems.length > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="ml-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full"
                        >
                            {cartItems.length}
                        </motion.span>
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
                            className="flex flex-col md:flex-row md:items-start gap-8 lg:gap-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Cart Items */}
                            <div className="flex-grow pb-48 md:pb-0 md:pr-6">
                                <FreeShippingBar subtotal={subtotal} threshold={freeShippingThreshold} />

                                <AnimatePresence mode="popLayout">
                                    <motion.div layout className="space-y-5">
                                        {cartItems.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                variants={itemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                layout
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <CartCard
                                                    item={item}
                                                    onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                                                    onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                                                    onRemove={() => removeItem(item.id)}
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Summary */}
                            <CheckoutSummary
                                subtotal={subtotal}
                                shippingFee={shippingFee}
                                onCheckout={() => router.push('/checkout')}
                                isLoading={loading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}