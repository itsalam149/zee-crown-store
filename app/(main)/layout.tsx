'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

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

export default function MainLayout({ children, modal }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);

    const bgGradient = selectedCategory ? (categoryBgClasses[selectedCategory] || 'from-grayBG to-gray-50') : 'from-grayBG to-gray-50';

    return (
        <div className={cn("flex flex-col min-h-screen bg-gradient-to-b transition-colors duration-500", bgGradient)}>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-6">
                {children}
                {modal}
            </main>
            <Footer />
        </div>
    );
}