// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, MapPin, UserCog } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider"; // Use client-side Auth hook
import { createClient } from "@/lib/supabase-client"; // Use client-side Supabase client
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Assuming shadcn avatar
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming shadcn dropdown
import Button from "@/components/ui/Button"; // Assuming Button component
import { useCart } from "@/store/CartContext"; // Import cart context
import SearchBar from "../ui/SearchBar"; // Import SearchBar

const Navbar = () => {
    const { user, profile, signOut } = useAuth(); // Get user, profile, and signOut from context
    const { cartCount } = useCart(); // Get cart count
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const supabase = createClient(); // Initialize client-side Supabase

    const getInitials = (name?: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const handleSignOut = async () => {
        await signOut();
        // Optionally redirect or show a toast message
    };

    // Temporary pathname for the useEffect hook above - uncomment usePathname import if needed
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        // Close mobile menu if window resizes to larger screen
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
            if (window.innerWidth >= 768 && isSearchOpen) {
                setIsSearchOpen(false); // Close search on desktop resize
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen, isSearchOpen]);

    // Close mobile menu on navigation
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // Assuming pathname is available if using usePathname hook

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Image src="/icon.png" alt="Zee Crown Logo" width={32} height={32} />
                    <span className="font-bold inline-block text-primary">Zee Crown</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
                    {/* Add desktop nav links here if needed */}
                    {/* Example: <Link href="/shop" className="text-foreground/60 transition-colors hover:text-foreground/80">Shop</Link> */}
                </nav>

                {/* Icons - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Desktop Search Bar */}
                    <div className="hidden lg:block w-64">
                        <SearchBar />
                    </div>
                    {/* Search Icon for smaller desktops/tablets */}
                    <Button variant="ghost" size="icon" className="lg:hidden text-foreground/60 hover:text-foreground/80" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        {/* Add AvatarImage logic if you store profile pictures */}
                                        {/* <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} /> */}
                                        <AvatarFallback className="bg-primary text-white text-xs">
                                            {getInitials(profile?.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {profile?.full_name || "Zee Crown User"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {/* --- ADDED MENU ITEMS --- */}
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center cursor-pointer">
                                        <UserCog className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/my-orders" className="flex items-center cursor-pointer">
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/addresses" className="flex items-center cursor-pointer">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span>My Addresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                                {/* --- END OF ADDED ITEMS --- */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button & Icons */}
                <div className="flex items-center gap-2 md:hidden">
                    {/* Mobile Search Icon */}
                    <Button variant="ghost" size="icon" className="text-foreground/60 hover:text-foreground/80" onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-foreground/60 hover:text-foreground/80"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
                <div className="absolute top-0 left-0 right-0 h-16 bg-background flex items-center px-4 md:hidden border-b z-50">
                    <SearchBar onSearch={() => setIsSearchOpen(false)} autoFocus /> {/* Close on search */}
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsSearchOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 z-40">
                    <nav className="flex flex-col gap-4 px-4 pt-4 text-sm font-medium">
                        {/* Add mobile nav links here */}
                        {/* Example: <Link href="/shop" className="text-foreground/60 transition-colors hover:text-foreground/80 py-2">Shop</Link> */}
                        {user ? (
                            <>
                                <Link href="/profile" className="text-foreground/60 transition-colors hover:text-foreground/80 py-2 flex items-center"><UserCog className="mr-2 h-4 w-4" />Profile</Link>
                                <Link href="/my-orders" className="text-foreground/60 transition-colors hover:text-foreground/80 py-2 flex items-center"><Package className="mr-2 h-4 w-4" />My Orders</Link>
                                <Link href="/addresses" className="text-foreground/60 transition-colors hover:text-foreground/80 py-2 flex items-center"><MapPin className="mr-2 h-4 w-4" />My Addresses</Link>
                                <button
                                    onClick={handleSignOut}
                                    className="text-red-500 hover:text-red-600 py-2 flex items-center text-left"
                                >
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="text-foreground/60 transition-colors hover:text-foreground/80 py-2">Login</Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;