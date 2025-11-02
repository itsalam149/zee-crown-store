// app/(main)/layout.tsx
'use client';

// import Footer from '@/components/layout/Footer'; // <-- Footer stays removed
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import { cn } from '@/lib/utils';
import Loading from './loading'; // Keep loading for Suspense

const categoryBgClasses: { [key: string]: string } = {
    medicine: 'from-[#6EE7B7] to-[#34D399]',   // soft light-green gradient
    cosmetics: 'from-[#93C5FD] to-[#3B82F6]',  // soft light-blue gradient
    food: 'from-[#FCA5A5] to-[#EF4444]',       // soft light-red gradient
    perfumes: 'from-[#FDE68A] to-[#F59E0B]',   // light-golden gradient
};


interface MainLayoutProps {
    children: React.ReactNode;
    modal?: React.ReactNode;
}

// This component uses the search params to dynamically change the background.
function MainLayoutContent({ children, modal }: MainLayoutProps) {
    const searchParams = useSearchParams();
    const selectedCategory = useMemo(() => searchParams.get('category'), [searchParams]);

    // FIX: Put the dynamic gradient logic back
    const bgGradient = selectedCategory
        ? (categoryBgClasses[selectedCategory] || 'from-grayBG to-gray-50')
        : 'from-grayBG to-gray-50';

    return (
        <div className={cn(
            "flex flex-col min-h-screen bg-gradient-to-b transition-colors duration-500 overflow-x-hidden",
            bgGradient // <-- This now uses your dynamic colors again
        )}>

            <Navbar />

            {/*
              This is correct. No container, no pt-16.
              Each page (like page.tsx) will add its own padding.
            */}
            <main className="flex-grow py-6">
                {children}
                {modal}
            </main>

            {/* Footer is still removed */}
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