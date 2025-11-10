// components/ui/BannerSlider.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Banner } from '@/lib/types';

// FIX: This component now accepts `banners` as a prop
export default function BannerSlider({ banners = [] }: { banners?: Banner[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Ensure banners is always an array
    const safeBanners = Array.isArray(banners) ? banners : [];

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        resetTimeout();
        if (safeBanners.length > 1) {
            timeoutRef.current = setTimeout(
                () =>
                    setCurrentIndex((prevIndex) =>
                        prevIndex === safeBanners.length - 1 ? 0 : prevIndex + 1
                    ),
                4000
            );
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, safeBanners]);

    if (!safeBanners || safeBanners.length === 0) {
        return (
            <div className="w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] bg-lighter-gray rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg">
            <div
                className="flex transition-transform duration-700 ease-out"
                style={{ 
                    transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                    willChange: 'transform'
                }}
            >
                {safeBanners.map((banner) => (
                    <div
                        key={banner.id}
                        className="flex-shrink-0 w-full aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] relative"
                    >
                        <Image
                            src={banner.image_url}
                            alt="Promotional Banner"
                            fill
                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 80vw"
                            className="object-cover"
                            priority={true}
                        />
                    </div>
                ))}
            </div>

            {safeBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {safeBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-200 ease-out ${currentIndex === index ? 'w-6 bg-primary' : 'w-2 bg-white/70 hover:bg-white'
                                }`}
                            style={{ willChange: 'width, background-color' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}