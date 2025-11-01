// app/(main)/layout.tsx
'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react'; // Removed useState
import { cn } from '@/lib/utils';
// import { motion, AnimatePresence } from 'framer-motion'; // Removed motion
import Loading from './loading'; // Keep loading for Suspense

// Define the background classes
const categoryBgClasses: { [key: string]: string } = {
    medicine: 'from-theme-green-bg to-gray-50',
    cosmetics: 'from-theme-blue-bg to-gray-50',
    food: 'from-theme-red-bg to-gray-50',
    perfumes: 'from-theme-gold-bg to-gray-50',
};

interface MainLayoutProps {
    children: React.ReactNode;
    modal?: React.ReactNode;
}

// This component uses the search params to dynamically change the background.
function MainLayoutContent({ children, modal }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);

    // Determine the gradient. Fallback to default if no category or category not in map.
    const bgGradient = selectedCategory
        ? (categoryBgClasses[selectedCategory] || 'from-grayBG to-gray-50')
        : 'from-grayBG to-gray-50';

    return (
        <div className={cn(
            "flex flex-col min-h-screen bg-gradient-to-b transition-colors duration-500 overflow-x-hidden",
            bgGradient
        )}>
            {/* Navbar now manages its own state. 
              We make it sticky to ensure it stays on top,
              and its mobile menu will overlay the content.
            */}
            <Navbar />

            {/* Main content is clean. No more variants.
              We add `pt-16` or similar to offset the sticky Navbar.
              (This padding should match your Navbar's height).
            */}
            <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-6">
                {children}
                {modal}
            </main>

            <Footer />
        </div>
    );
}

// The Suspense wrapper is still required because MainLayoutContent uses useSearchParams.
export default function MainLayout({ children, modal }: MainLayoutProps) {
    return (
        <Suspense fallback={<Loading />}>
            <MainLayoutContent modal={modal}>
                {children}
            </MainLayoutContent>
        </Suspense>
    );
}