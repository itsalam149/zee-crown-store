'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, Package, MapPin, UserCog, LifeBuoy, Home, Search } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase-client';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from '../ui/SearchBar'; // Import the SearchBar

export default function Navbar() {
    const { session } = useAuthStore();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const [cartCount, setCartCount] = useState(0);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); // State for search bar

    const menuRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Fetch and subscribe to cart item count
    useEffect(() => {
        if (!session) {
            setCartCount(0);
            return;
        }

        const fetchCartCount = async () => {
            const { count } = await supabase
                .from('cart_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id);
            setCartCount(count ?? 0);
        };

        fetchCartCount();

        const channel = supabase
            .channel('cart_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${session.user.id}` },
                fetchCartCount
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, supabase]);


    const handleLogout = async () => {
        setProfileMenuOpen(false);
        setSidebarOpen(false);
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        router.push('/');
        router.refresh();
    };

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setProfileMenuOpen(false);
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) setSidebarOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen]);

    // Close other menus when search is opened
    useEffect(() => {
        if (isSearchOpen) {
            setSidebarOpen(false);
            setProfileMenuOpen(false);
        }
    }, [isSearchOpen]);


    const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode; }) => (
        <Link href={href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 text-lg font-medium text-gray-700 hover:text-primary transition-colors p-3 rounded-md hover:bg-primary/10">
            {icon}
            {children}
        </Link>
    );

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
                className="sticky top-4 z-50 w-[95%] max-w-6xl mx-auto"
            >
                <div className="relative bg-white/70 backdrop-blur-lg rounded-xl shadow-medium border overflow-hidden">
                    <div className="container mx-auto px-4">
                        <AnimatePresence>
                            {isSearchOpen ? (
                                <motion.div
                                    key="search-bar"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center h-16 gap-2"
                                >
                                    <SearchBar />
                                    <button onClick={() => setIsSearchOpen(false)} className="p-2 text-gray-500 hover:text-dark-gray">
                                        <X size={24} />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="nav-bar"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-between h-16"
                                >
                                    {/* Left Side: Menu and Logo */}
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2">
                                            <Menu className="h-6 w-6 text-dark-gray" />
                                        </button>
                                        <Link href="/" className="flex items-center gap-2">
                                            <Image src="/icon.png" alt="Zee Crown Logo" width={32} height={32} />
                                            <span className="font-bold text-xl hidden sm:block text-dark-gray">Zee Crown</span>
                                        </Link>
                                    </div>

                                    {/* Right Side: Icons */}
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                            <Search className="h-6 w-6 text-dark-gray" />
                                        </button>
                                        <Link
                                            href="/cart"
                                            className={cn("relative p-2 rounded-full transition-colors", pathname === '/cart' ? 'bg-primary/10' : 'hover:bg-gray-100')}
                                        >
                                            <ShoppingCart className={cn("h-6 w-6", pathname === '/cart' ? 'text-primary' : 'text-dark-gray')} />
                                            <AnimatePresence>
                                                {cartCount > 0 && (
                                                    <motion.div
                                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                        className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-white text-xs font-bold rounded-full"
                                                    >
                                                        {cartCount}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Link>

                                        {session ? (
                                            <div className="relative hidden md:block" ref={menuRef}>
                                                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                                    <User className="h-6 w-6 text-dark-gray" />
                                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {isProfileMenuOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-0 mt-2 w-60 origin-top-right bg-white rounded-md shadow-lg overflow-hidden z-20"
                                                        >
                                                            {/* Dropdown content... */}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ) : (
                                            <Link href="/login" className="hidden md:flex items-center gap-2 py-2 px-4 rounded-full bg-primary text-white font-semibold transition-transform hover:scale-105">
                                                Login
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 z-50 md:hidden"
                        />
                        <motion.div
                            ref={sidebarRef}
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 md:hidden"
                        >
                            <div className="flex justify-between items-center p-4 border-b">
                                <span className="font-bold text-lg">Menu</span>
                                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-gray-100"><X /></button>
                            </div>
                            <nav className="p-4 space-y-2">
                                {/* NavLink content... */}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}