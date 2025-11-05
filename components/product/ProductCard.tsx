// components/product/ProductCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// --- 1. DELETE THIS ENTIRE HELPER FUNCTION ---
/*
function getTransformedUrl(url: string, width: number, height: number) {
    if (!url) return '/placeholder.png'; // A fallback image
    // This replaces '/object/public/' with '/render/image/public/'
    // and adds transform parameters.
    return url.replace(
        '/object/public/',
        `/render/image/public/`
    ) + `?width=${width}&height=${height}&resize=contain&quality=80`;
}
*/
// ---------------------------------------------

export default function ProductCard({ product }: { product: Product }) {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const href = currentCategory
        ? `/product/${product.id}?category=${currentCategory}`
        : `/product/${product.id}`;

    // --- 2. REMOVE THE HELPER FUNCTION CALL ---
    // const transformedSrc = getTransformedUrl(product.image_url, 500, 500);

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
                <div className="relative w-full aspect-square overflow-hidden">
                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                            {discount}% OFF
                        </div>
                    )}
                    <Image
                        // 3. USE THE ORIGINAL URL (and add a fallback)
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-110"
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