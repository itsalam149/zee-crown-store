"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Order } from '@/lib/types';
import OrderCard from '@/components/orders/OrderCard';
import OrderCardSkeleton from '@/components/skeletons/OrderCardSkeleton';
import {
    PackageOpen,
    AlertTriangle,
    ShoppingCart,
    RefreshCw,
    Filter,
    Package,
    Clock,
    Truck,
    CheckCircle,
    XCircle // Added icons
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // --- 1. IMPORTED Variants ---
import { cn } from '@/lib/utils'; // Import cn for dynamic classes

// Enhanced animation variants
const containerVariants: Variants = { // <-- Added Variants type
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = { // <-- Added Variants type
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    },
    exit: {
        opacity: 0,
        x: -50,
        scale: 0.95,
        transition: { duration: 0.2 }
    }
};

// --- 2. APPLIED Variants TYPE ---
const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
    }
};

// --- 2. APPLIED Variants TYPE ---
const statsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// --- Filter Configuration (Source of Truth) ---
// Define filter buttons with icons and colors
const filterConfig: {
    label: string;
    value: OrderStatus;
    icon: React.ElementType;
    activeClass: string;
}[] = [
        { label: 'All', value: 'all', icon: PackageOpen, activeClass: 'bg-primary text-white' },
        { label: 'Pending', value: 'pending', icon: Clock, activeClass: 'bg-yellow-500 text-white' },
        { label: 'Processing', value: 'processing', icon: Package, activeClass: 'bg-blue-600 text-white' },
        { label: 'Shipped', value: 'shipped', icon: Truck, activeClass: 'bg-indigo-600 text-white' },
        { label: 'Delivered', value: 'delivered', icon: CheckCircle, activeClass: 'bg-green-600 text-white' },
        { label: 'Cancelled', value: 'cancelled', icon: XCircle, activeClass: 'bg-red-600 text-white' }
    ];

export default function MyOrdersPage() {
    const supabase = createClient();
    const router = useRouter();
    const { session } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [activeFilter, setActiveFilter] = useState<OrderStatus>('all');

    // Calculate order statistics (still needed for filter counts)
    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalSpent: orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
    };

    const fetchOrders = useCallback(async () => {
        if (!session) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*, products(*))')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
                setOrders([]);
                setError(error.message);
            } else if (data) {
                setOrders(data as Order[]);
                setFilteredOrders(data as Order[]); // Set initial filtered list
                setActiveFilter('all'); // Reset filter to 'all' on fetch
            }
        } catch (err: any) {
            console.error('Unexpected error:', err);
            setOrders([]);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [session, supabase]);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        fetchOrders();
    }, [session, router, fetchOrders]);

    // Filter orders based on active filter
    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === activeFilter));
        }
    }, [activeFilter, orders]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        fetchOrders();
    };

    const handleFilterChange = (filter: OrderStatus) => {
        setActiveFilter(filter);
    };

    // --- RENDER FUNCTIONS FOR CLEAN JSX ---

    const renderLoading = () => (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <div className="mt-6 space-y-6">
                <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <OrderCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card text-center p-12 mt-8"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <AlertTriangle size={72} className="mx-auto text-red-500" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold mt-6">Unable to Load Orders</h1>
                <p className="text-gray-600 mt-3 max-w-md mx-auto">
                    We encountered an issue while fetching your orders. This might be a temporary connection problem.
                </p>
                {retryCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                        Retry attempt: {retryCount}
                    </p>
                )}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleRetry} className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">Go Home</Link>
                    </Button>
                </div>
                <details className="mt-6 text-left max-w-md mx-auto">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                        Technical details
                    </summary>
                    <p className="text-xs text-red-600 mt-2 p-3 bg-red-50 rounded-lg font-mono">
                        {error}
                    </p>
                </details>
            </motion.div>
        </div>
    );

    const renderEmpty = () => (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <BackButton />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card text-center p-12 mt-8"
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <PackageOpen size={80} className="mx-auto text-gray-300" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold mt-6">No Orders Yet</h1>
                <p className="text-gray-500 mt-3 max-w-md mx-auto">
                    Start your shopping journey and discover amazing products waiting for you.
                </p>
                <Button asChild className="mt-8">
                    <Link href="/" className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Start Shopping
                    </Link>
                </Button>
            </motion.div>
        </div>
    );

    // --- MAIN RENDER ---

    if (loading) return renderLoading();
    if (!session) return null; // Should be redirecting
    if (error) return renderError();
    if (orders.length === 0) return renderEmpty();

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <BackButton />

            {/* Header */}
            <motion.div
                variants={headerVariants}
                initial="hidden"
                animate="visible"
                className="mt-6"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">My Orders</h1>
                        <p className="text-gray-600 mt-1">
                            Track and manage your purchases
                        </p>
                    </div>
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {/* --- ENHANCED Filter Tabs --- */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 glass-card p-2"
            >
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2" />
                    {filterConfig.map((filter) => {
                        const count = orderStats[filter.value as keyof typeof orderStats] as number || 0;
                        if (filter.value !== 'all' && count === 0) return null; // Hide filter if count is 0

                        return (
                            <button
                                key={filter.value}
                                onClick={() => handleFilterChange(filter.value)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0",
                                    activeFilter === filter.value
                                        ? filter.activeClass // Apply dynamic active class
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                <filter.icon className="h-4 w-4" />
                                <span>{filter.label}</span>
                                <span
                                    className={cn(
                                        "ml-1.5 px-2 py-0.5 rounded-full text-xs",
                                        activeFilter === filter.value
                                            ? "bg-white/20"
                                            : "bg-gray-200 text-gray-600"
                                    )}
                                >
                                    {filter.value === 'all' ? orderStats.total : count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Orders List */}
            <motion.div
                className="mt-8 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="glass-card text-center p-12"
                        >
                            <PackageOpen size={48} className="mx-auto text-gray-300" />
                            <p className="text-gray-600 mt-4">
                                No orders found with status: <span className="font-semibold">{activeFilter}</span>
                            </p>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                variants={itemVariants}
                                layout
                                exit="exit"
                                custom={index}
                            >
                                <OrderCard order={order} />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}