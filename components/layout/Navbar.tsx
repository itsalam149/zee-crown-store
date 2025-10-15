'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, Package, MapPin, UserCog, LifeBuoy, Home } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase-client';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const { session } = useAuthStore();
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        setSidebarOpen(false);
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        router.push('/');
        router.refresh();
    };

    // Close dropdown/sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
            if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);

    const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
        <Link href={href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-4 text-lg font-medium text-gray-700 hover:text-primary transition-colors p-3 rounded-md hover:bg-primary/10">
            {children}
        </Link>
    );

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2">
                                <Menu className="h-6 w-6 text-dark-gray" />
                            </button>
                            <Link href="/" className="flex items-center gap-2 transform transition-transform hover:scale-105">
                                <Image src="/icon.png" alt="Zee Crown Logo" width={40} height={40} />
                                <span className="font-bold text-xl hidden sm:block text-dark-gray">Zee Crown</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                <ShoppingCart className="h-6 w-6 text-dark-gray" />
                            </Link>

                            {session ? (
                                <div className="relative hidden md:block" ref={menuRef}>
                                    <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                        <User className="h-6 w-6 text-dark-gray" />
                                        <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={cn('absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 transition-all duration-200 ease-out', isProfileMenuOpen ? 'transform opacity-100 scale-100' : 'transform opacity-0 scale-95 pointer-events-none')}>
                                        <div className="py-2">
                                            <div className="px-4 py-2 border-b">
                                                <p className="font-semibold text-sm truncate">{session.user.email}</p>
                                            </div>
                                            <Link href="/my-orders" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Package size={16} /> My Orders</Link>
                                            <Link href="/addresses" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><MapPin size={16} /> My Addresses</Link>
                                            <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserCog size={16} /> Edit Profile</Link>
                                            <Link href="/help" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><LifeBuoy size={16} /> Help Center</Link>
                                            <div className="border-t border-gray-200 mt-1"></div>
                                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red hover:bg-red-50">
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className="hidden md:flex items-center gap-2 p-2 px-4 rounded-full bg-primary text-white font-semibold transition-transform hover:scale-105">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Mobile Sidebar --- */}
            <div onClick={() => setSidebarOpen(false)} className={cn('fixed inset-0 bg-black/40 z-50 transition-opacity md:hidden', isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} />
            <div ref={sidebarRef} className={cn('fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-out-expo md:hidden', isSidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
                <div className="flex justify-between items-center p-4 border-b">
                    <span className="font-bold text-lg">Menu</span>
                    <button onClick={() => setSidebarOpen(false)} className="p-2"><X /></button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink href="/"><Home size={20} /> Home</NavLink>
                    {session ? (
                        <>
                            <div className="px-3 pt-4">
                                <p className="font-semibold text-sm truncate">{session.user.email}</p>
                            </div>
                            <NavLink href="/my-orders"><Package size={20} /> My Orders</NavLink>
                            <NavLink href="/addresses"><MapPin size={20} /> My Addresses</NavLink>
                            <NavLink href="/profile"><UserCog size={20} /> Edit Profile</NavLink>
                            <NavLink href="/help"><LifeBuoy size={20} /> Help Center</NavLink>
                            <div className="pt-4 mt-4 border-t">
                                <button onClick={handleLogout} className="flex items-center gap-4 text-lg font-medium text-red p-3 rounded-md hover:bg-red-50 w-full">
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="pt-4 mt-4 border-t">
                            <NavLink href="/login"><User size={20} /> Login / Sign Up</NavLink>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}