// components/ui/BannerSlider.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Banner } from '@/lib/types';

export default function BannerSlider({ banners }: { banners: Banner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        if (banners.length > 1) {
            timeoutRef.current = setTimeout(
                () =>
                    setCurrentIndex((prevIndex) =>
                        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
                    ),
                4000
            );
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, banners]);

    if (!banners || banners.length === 0) {
        return (
            // --- 1. UPDATED SKELETON ---
            // Changed mobile aspect ratio from 1.8/1 to 2.5/1
            <div className="w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] bg-lighter-gray rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg">
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    // --- 2. UPDATED PARENT DIV ---
                    // Changed default (mobile) from aspect-[1.8/1] to aspect-[2.5/1]
                    // Removed sm: breakpoint as 2.5/1 is a good default
                    <div
                        key={banner.id}
                        className="flex-shrink-0 w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] relative"
                    >
                        {/* --- 3. UPDATED IMAGE COMPONENT --- */}
                        <Image
                            src={banner.image_url}
                            alt="Promotional Banner"
                            fill // Use fill to obey parent's aspect ratio
                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 80vw" // Adjusted sizes
                            className="object-cover" // Removed w-full and h-auto
                            priority={true}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-white/70 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}