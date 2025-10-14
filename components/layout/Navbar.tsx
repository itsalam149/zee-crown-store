'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut, LogIn, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
    const { session } = useAuthStore();
    const supabase = createClient();
    const router = useRouter();
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        setProfileMenuOpen(false);
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        router.push('/');
        router.refresh();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 transform transition-transform hover:scale-105">
                        <Image src="/icon.png" alt="Zee Crown Logo" width={40} height={40} />
                        <span className="font-bold text-xl hidden sm:block text-dark-gray">Zee Crown</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                            <ShoppingCart className="h-6 w-6 text-dark-gray" />
                        </Link>

                        {session ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <User className="h-6 w-6 text-dark-gray" />
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* --- Profile Dropdown Menu --- */}
                                <div
                                    className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 transition-all duration-200 ease-out ${isProfileMenuOpen ? 'transform opacity-100 scale-100' : 'transform opacity-0 scale-95 pointer-events-none'
                                        }`}
                                >
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-sm text-gray-700">
                                            <p className="font-semibold">My Account</p>
                                        </div>
                                        <Link href="/my-orders" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                                        <Link href="/addresses" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Addresses</Link>
                                        <Link href="/profile" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Profile</Link>
                                        <div className="border-t border-gray-200"></div>
                                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red hover:bg-red-50">
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                <LogIn className="h-6 w-6 text-dark-gray" />
                                <span className="text-sm font-medium hidden md:block">Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}