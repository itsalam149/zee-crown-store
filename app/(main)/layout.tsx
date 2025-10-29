// app/(main)/layout.tsx
'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react'; // Import useState and Suspense
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import Loading from './loading'; // Import a loading component for Suspense fallback

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

// Wrap the main logic in a component to use hooks after Suspense
function MainLayoutContent({ children, modal }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);
    const bgGradient = selectedCategory ? (categoryBgClasses[selectedCategory] || 'from-grayBG to-gray-50') : 'from-grayBG to-gray-50';

    // Lifted state for mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const mainContentVariants = {
        closed: {
            y: 0,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        open: {
            y: 60, // How much to push down
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        }
    };

    return (
        <div className={cn(
            "flex flex-col min-h-screen bg-gradient-to-b transition-colors duration-500 overflow-x-hidden",
            bgGradient
        )}>
            {/* Pass state and setter down to Navbar */}
            <Navbar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            {/* Use AnimatePresence in case modal needs animating based on menu */}
            <AnimatePresence>
                <motion.main
                    className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-6 relative z-10" // Lower z-index than navbar
                    variants={mainContentVariants}
                    animate={isMobileMenuOpen ? 'open' : 'closed'}
                    initial={false} // Prevent initial animation on load
                >
                    {children}
                    {modal}
                </motion.main>
            </AnimatePresence>
            <Footer />
        </div>
    );
}


// Export the component wrapped in Suspense
export default function MainLayout({ children, modal }: MainLayoutProps) {
    // Suspense is needed because MainLayoutContent uses useSearchParams
    return (
        <Suspense fallback={<Loading />}> {/* Or a simpler loading indicator */}
            <MainLayoutContent modal={modal}>
                {children}
            </MainLayoutContent>
        </Suspense>
    );
}