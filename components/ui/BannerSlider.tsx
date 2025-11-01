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
            // Updated aspect ratios here as well for the skeleton
            <div className="w-full aspect-[1.8/1] sm:aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] bg-lighter-gray rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg">
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    // --- THIS IS THE UPDATED LINE ---
                    <div
                        key={banner.id}
                        className="flex-shrink-0 w-full aspect-[1.8/1] sm:aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] relative"
                    >
                        <Image
                            src={banner.image_url}
                            alt="Promotional Banner"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 80vw"
                            style={{ objectFit: 'cover' }}
                            priority={true}
                        />
                    </div>
                    // --- END OF UPDATE ---
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