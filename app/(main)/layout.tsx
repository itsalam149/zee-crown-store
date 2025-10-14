'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// Using the main, darker theme colors now
const categoryBgClasses: { [key: string]: string } = {
    medicine: 'bg-theme-green',
    cosmetics: 'bg-theme-blue',
    food: 'bg-theme-red',
    perfumes: 'bg-theme-gold',
};

export default function MainLayout({
    children,
    modal,
}: {
    children: React.React.Node;
    modal: React.React.Node;
}) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);
    const bgColor = selectedCategory ? categoryBgClasses[selectedCategory] : 'bg-grayBG';

    return (
        // The background color of the entire page will now change
        <div className={cn("flex flex-col min-h-screen transition-colors duration-500", bgColor)}>
            {/* Navbar remains on a consistent background for clarity */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
                <Navbar />
            </div>
            <main className="flex-grow container mx-auto px-4 py-6">
                {children}
                {modal}
            </main>
            <Footer />
        </div>
    );
}