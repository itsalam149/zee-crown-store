'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Mapping categories to the new soft pastel background colors
const categoryBgClasses: { [key: string]: string } = {
    medicine: 'bg-theme-green-bg',
    cosmetics: 'bg-theme-blue-bg',
    food: 'bg-theme-red-bg',
    perfumes: 'bg-theme-gold-bg',
};

interface MainLayoutProps {
    children: React.ReactNode;
    modal?: React.ReactNode;
}

export default function MainLayout({ children, modal }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);

    // If a category is selected, use its color; otherwise, fallback to default gray background
    const bgColor = selectedCategory ? (categoryBgClasses[selectedCategory] || 'bg-grayBG') : 'bg-grayBG';

    return (
        <div className={cn("flex flex-col min-h-screen transition-colors duration-500", bgColor)}>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 md:px-8 py-6">
                {children}
                {modal}
            </main>
            <Footer />
        </div>
    );
}
