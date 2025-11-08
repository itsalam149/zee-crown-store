// app/(main)/ProductListClient.tsx
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ProductCardType } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import CategoryItem from '@/components/product/CategoryItem';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';

const PRODUCTS_PER_PAGE = 10;

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const gridItemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    show: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
    exit: {
        y: -10,
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.2 },
    },
};

interface ProductListClientProps {
    initialProducts: ProductCardType[];
    initialHasMore: boolean;
    textColor: string;
    selectedCategory: string;
    searchQuery: string;
}

export default function ProductListClient({
    initialProducts,
    initialHasMore,
    textColor,
    selectedCategory,
    searchQuery
}: ProductListClientProps) {

    const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
    const [loading, setLoading] = useState(false); // No initial load
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver>();

    // --- THIS IS THE FIX ---
    // When the category changes, new `initialProducts` are passed in.
    // We MUST reset the page count and hasMore flag, otherwise the
    // scroll state from the OLD category will be kept.
    useEffect(() => {
        setProducts(initialProducts);
        setPage(1); // <-- Resets the page counter
        setHasMore(initialHasMore); // <-- Resets the hasMore flag
    }, [initialProducts, initialHasMore, selectedCategory, searchQuery]); // <-- This ensures it resets on every category/search change
    // --- END OF FIX ---


    const loadMoreProducts = useCallback(async () => {
        if (loadingMore || !hasMore) return; // This check will now work correctly
        setLoadingMore(true);

        const params = new URLSearchParams({
            category: selectedCategory,
            q: searchQuery,
            page: page.toString(), // `page` is 1, so it fetches page 1
        });

        try {
            const res = await fetch(`/api/products?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch more products");

            const data = await res.json();

            if (data.products && data.products.length > 0) {
                setProducts((prev) => [...prev, ...data.products]);
                setPage((prev) => prev + 1); // Go to page 2
                setHasMore(data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more products:", error);
            setHasMore(false);
        }

        setLoadingMore(false);
    }, [page, hasMore, loadingMore, selectedCategory, searchQuery]);


    const lastProductElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    // This callback will now have the correct `hasMore` value
                    if (entries[0].isIntersecting && hasMore && !loadingMore) {
                        loadMoreProducts();
                    }
                },
                { threshold: 0.5 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMoreProducts, loadingMore] // This will update correctly when `hasMore` is reset
    );

    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div>
            {/* Category List */}
            <div className="grid grid-cols-5 gap-x-2 gap-y-4 mb-8">
                {categories.map((cat) => (
                    <CategoryItem
                        key={cat.name}
                        name={cat.name}
                        Icon={cat.icon}
                        isSelected={selectedCategory === cat.name && !searchQuery}
                    />
                ))}
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8"
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
            >
                <AnimatePresence>
                    {showUploadCard && (
                        <motion.div
                            key="upload-card"
                            variants={gridItemVariants}
                            exit="exit"
                        >
                            <UploadPrescriptionCard />
                        </motion.div>
                    )}

                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            ref={products.length === index + 1 ? lastProductElementRef : null}
                            variants={gridItemVariants}
                            exit="exit"
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {loadingMore && <Spinner />}

            {products.length === 0 && !loading && (
                <div className="col-span-full text-center py-16 flex flex-col items-center">
                    <PackageSearch size={64} className={cn(textColor === 'text-white' ? 'text-white/50' : 'text-gray-300')} />
                    <h3 className={cn('text-2xl font-bold mt-4', textColor)}>
                        {searchQuery ? 'No Products Match Your Search' : 'No Products Found'}
                    </h3>
                    <p className={cn('mt-2', textColor === 'text-white' ? 'text-white/70' : 'text-gray-500')}>
                        Try adjusting your category{searchQuery ? ' or search term' : ''}.
                    </p>
                </div>
            )}
        </div>
    );
}