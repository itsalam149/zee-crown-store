// components/product/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ProductCardType } from '@/lib/types'; // Use new type
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function ProductCard({ product }: { product: ProductCardType }) {

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    // Build href with product.category
    const href = product.category
        ? `/product/${product.id}?category=${product.category}`
        : `/product/${product.id}`;

    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full"
        >
            <Link
                href={href}
                scroll={false}
                className="group block rounded-xl overflow-hidden glass-card transition-shadow duration-300 ease-out-expo hover:shadow-medium"
            >
                <div className="relative w-full aspect-square overflow-hidden bg-lighter-gray">
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            {discount}% OFF
                        </div>
                    )}
                    <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className={cn(
                            "object-cover transition-all duration-500 ease-out-expo group-hover:scale-110",
                            isImageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        // Use onLoad to fix the console warning
                        onLoad={() => setIsImageLoaded(true)}
                    />
                </div>
                <div className="p-3">
                    <h3 className="text-sm font-semibold truncate text-dark-gray">{product.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                        <div>
                            <span className="text-base font-bold text-primary">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
                            )}
                        </div>
                        <div className="bg-white/70 backdrop-blur p-1.5 rounded-full text-dark-gray transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:rotate-90">
                            <Plus size={16} />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}