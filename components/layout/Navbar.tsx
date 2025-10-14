'use client';
import Link from 'next/link';
import { ShoppingCart, User, Menu } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/icon.png" alt="Zee Crown Logo" width={40} height={40} />
                        <span className="font-bold text-xl hidden sm:block text-dark-gray">Zee Crown</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/?category=medicine" className="text-gray-600 hover:text-primary transition-colors">Medicine</Link>
                        <Link href="/?category=cosmetics" className="text-gray-600 hover:text-primary transition-colors">Cosmetics</Link>
                        <Link href="/?category=food" className="text-gray-600 hover:text-primary transition-colors">Food</Link>
                        <Link href="/?category=perfumes" className="text-gray-600 hover:text-primary transition-colors">Perfumes</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100">
                            <ShoppingCart className="h-6 w-6 text-dark-gray" />
                        </Link>
                        <Link href="/my-orders" className="p-2 rounded-full hover:bg-gray-100">
                            <User className="h-6 w-6 text-dark-gray" />
                        </Link>
                        <button className="p-2 rounded-full hover:bg-gray-100 md:hidden">
                            <Menu className="h-6 w-6 text-dark-gray" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}