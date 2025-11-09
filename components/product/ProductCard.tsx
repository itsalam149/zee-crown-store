// components/product/ProductCard.tsx (OPTIMIZED)
'use client';

import Link from 'next/link';
import { ProductCardType } from '@/lib/types';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/ui/OptimizedImage';

// Memoize to prevent unnecessary re-renders
const ProductCard = memo(function ProductCard({ product }: { product: ProductCardType }) {
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const href = product.category
        ? `/product/${product.id}?category=${product.category}`
        : `/product/${product.id}`;

    return (
        <Link
            href={href}
            scroll={false}
            className={cn(
                "group block rounded-xl overflow-hidden bg-white shadow-sm",
                "transition-shadow duration-200", // Simplified transition
                "hover:shadow-md active:shadow-sm" // Touch-friendly states
            )}
        >
            <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {discount}% OFF
                    </div>
                )}
                <OptimizedImage
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    objectFit="cover"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-gray-900">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <div>
                        <span className="text-base font-bold text-primary">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
                        )}
                    </div>
                    <div className="bg-gray-100 p-1.5 rounded-full text-gray-700 transition-colors group-hover:bg-primary group-hover:text-white">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default ProductCard;