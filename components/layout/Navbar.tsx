// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, X, Search, LogOut, Package, MapPin, UserCog } from "lucide-react";
import { useState, useEffect } from "react"; // Keep local useState for isSearchOpen
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Button from "@/components/ui/Button";
import { useCart } from "@/store/CartContext";
import SearchBar from "../ui/SearchBar";
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import CategoryBar from './CategoryBar';
import { usePathname } from "next/navigation"; // Use usePathname hook

// Define props including the lifted state and setter
interface NavbarProps {
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

// Update component signature to accept props
const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) => {
    const { user, profile, signOut } = useAuth();
    const { cartCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const supabase = createClient();
    const pathname = usePathname(); // Get current path

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
        setIsMobileMenuOpen(false); // Close menu on sign out
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                if (isMobileMenuOpen) setIsMobileMenuOpen(false); // Close mobile menu on resize to desktop
                if (isSearchOpen) setIsSearchOpen(false); // Close search on resize to desktop
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobileMenuOpen, isSearchOpen, setIsMobileMenuOpen]); // Add setIsMobileMenuOpen to deps

    // Close mobile menu on navigation
    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]); // Use pathname from hook

    // --- Refined Mobile Menu Animation Variants ---
    const mobileMenuVariants = {
        hidden: {
            opacity: 0,
            y: "-10%", // Start slightly higher
            transition: { duration: 0.2, ease: "easeIn" } // Faster exit transition
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.25, ease: "easeOut" } // Slightly longer enter transition
        },
        exit: {
            opacity: 0,
            y: "-10%",
            transition: { duration: 0.2, ease: "easeIn" }
        }
    };
    // ------------------------------------------

    return (
        // Added relative positioning and z-index to ensure it stays above potentially transformed main content
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="mr-6 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}> {/* Close menu on logo click */}
                    <Image src="/icon.png" alt="Zee Crown Logo" width={32} height={32} />
                    <span className="font-bold inline-block text-primary">Zee Crown</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
                    {/* Add desktop nav links here if needed */}
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

                    {/* Cart Icon */}
                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* User Dropdown / Login */}
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
                                <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
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
                    {/* Mobile Cart Icon */}
                    <Link href="/cart" className="relative text-foreground/60 transition-colors hover:text-foreground/80" onClick={() => setIsMobileMenuOpen(false)}> {/* Close menu on cart click */}
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {/* Hamburger Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Use setter from props
                        className="text-foreground/60 hover:text-foreground/80"
                        aria-label="Toggle mobile menu"
                    >
                        {/* Animated Icon Change */}
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={isMobileMenuOpen ? 'close' : 'open'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </div>
            </div>
            {/* Flipkart-like category ribbon */}
            <div className="hidden md:block">
                <CategoryBar />
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-0 left-0 right-0 h-16 bg-background flex items-center px-4 md:hidden border-b z-40" // z-index lower than header content
                    >
                        <SearchBar onSearch={() => setIsSearchOpen(false)} autoFocus />
                        <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsSearchOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Updated Mobile Menu Overlay --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        variants={mobileMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        // Changed background, added shadow, padding
                        className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 pb-6 z-40" // Solid white bg, shadow, more padding-bottom
                    >
                        <nav className="flex flex-col gap-1 px-4 pt-4 text-base font-medium"> {/* Reduced gap slightly */}
                            {user ? (
                                <>
                                    {/* Added more padding (py-3), subtle hover */}
                                    <Link href="/profile" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-colors duration-150"><UserCog className="h-5 w-5 text-gray-500" />Profile</Link>
                                    <Link href="/my-orders" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-colors duration-150"><Package className="h-5 w-5 text-gray-500" />My Orders</Link>
                                    <Link href="/addresses" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-colors duration-150"><MapPin className="h-5 w-5 text-gray-500" />My Addresses</Link>
                                    <hr className="my-3 border-gray-100" /> {/* Subtle divider */}
                                    <button
                                        onClick={handleSignOut}
                                        className="text-red-600 hover:bg-red-50 py-3 flex items-center gap-3 rounded-md px-3 text-left w-full transition-colors duration-150"
                                    >
                                        <LogOut className="h-5 w-5" /> Log out
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="text-gray-700 hover:text-primary py-3 flex items-center gap-3 rounded-md hover:bg-gray-50 px-3 transition-colors duration-150">Login / Sign Up</Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* --- End Mobile Menu Overlay --- */}
        </header>
    );
};

export default Navbar;