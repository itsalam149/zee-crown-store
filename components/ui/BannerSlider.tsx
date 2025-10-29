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
                4000 // Slightly longer duration
            );
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, banners]);

    if (!banners || banners.length === 0) {
        return (
            <div className="w-full aspect-[2/1] md:aspect-[3/1] bg-lighter-gray rounded-lg animate-pulse" />
        );
    }

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-lg shadow-lg">
            <div
                className="flex transition-transform duration-700 ease-in-out" // Smoother transition
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="flex-shrink-0 w-full aspect-[2/1] md:aspect-[3/1] relative">
                        <Image
                            src={banner.image_url}
                            alt="Promotional Banner"
                            fill
                            sizes="(max-width: 768px) 100vw, 80vw"
                            style={{ objectFit: 'cover' }}
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