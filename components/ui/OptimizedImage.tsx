// components/ui/OptimizedImage.tsx
'use client';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    objectFit?: 'cover' | 'contain' | 'fill';
    mobileQuality?: number;
    desktopQuality?: number;
}

export default function OptimizedImage({
    src,
    alt,
    fill,
    width,
    height,
    className,
    priority = false,
    sizes,
    objectFit = 'cover',
    mobileQuality = 60, // ⬅️ lower quality for mobile (saves ~40%)  
    desktopQuality = 75, // ⬅️ balanced for larger screens
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Dynamically adjust quality based on screen size
    const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, []);
    const quality = isMobile ? mobileQuality : desktopQuality;

    return (
        <div className={cn("relative overflow-hidden", fill && "w-full h-full", className)}>
            {isLoading && !error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
                src={error ? '/placeholder.png' : src}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                quality={quality}
                loading={priority ? 'eager' : 'lazy'}
                priority={priority}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
                className={cn(
                    "transition-opacity duration-200 ease-out",
                    isLoading ? "opacity-0" : "opacity-100",
                    objectFit === 'cover' && "object-cover",
                    objectFit === 'contain' && "object-contain"
                )}
                style={{ willChange: isLoading ? 'opacity' : 'auto' }}
            />
        </div>
    );
}