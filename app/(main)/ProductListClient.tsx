// app/(main)/ProductListClient.tsx
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
// --- IMPORT ICONS AND CategoryItem HERE ---
import CategoryItem from '@/components/product/CategoryItem';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';

const PRODUCTS_PER_PAGE = 10;

// --- MOVE THE categories ARRAY HERE ---
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

// 1. Accept initial data and props
interface ProductListClientProps {
    initialProducts: Product[];
    textColor: string;
    selectedCategory: string;
    searchQuery: string;
}

export default function ProductListClient({
    initialProducts,
    textColor,
    selectedCategory,
    searchQuery
}: ProductListClientProps) {

    const supabase = createClient();
    // 2. Set initial state from props
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false); // Initial load is done, so set to false
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialProducts.length === PRODUCTS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver>();

    // 3. This effect handles FILTER CHANGES
    // When the server passes new initialProducts (because searchParams changed),
    // this effect will run and reset the state.
    useEffect(() => {
        setProducts(initialProducts);
        setPage(1);
        setHasMore(initialProducts.length === PRODUCTS_PER_PAGE);
        setLoading(false); // Ensure loading is off
    }, [initialProducts]); // This effect now correctly depends on the prop

    // 4. This is the INIFINITE SCROLL logic
    const loadMoreProducts = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const from = page * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        let queryBuilder = supabase.from('products').select('*').range(from, to);
        if (selectedCategory !== 'All') {
            queryBuilder = queryBuilder.eq('category', selectedCategory);
        }
        if (searchQuery) {
            queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }

        const { data: newProducts } = await queryBuilder.order('created_at', { ascending: false });

        if (newProducts && newProducts.length > 0) {
            setProducts((prev) => [...prev, ...newProducts]);
            setPage((prev) => prev + 1);
            if (newProducts.length < PRODUCTS_PER_PAGE) setHasMore(false);
        } else {
            setHasMore(false);
        }
        setLoadingMore(false);
    }, [page, hasMore, loadingMore, selectedCategory, searchQuery, supabase]);

    // 5. IntersectionObserver
    const lastProductElementRef = useCallback(
        (node: HTMLDivElement) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !loadingMore) {
                        loadMoreProducts();
                    }
                },
                { threshold: 0.5 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadMoreProducts, loadingMore]
    );

    // 6. This is the JSX
    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div>
            {/* --- RENDER THE CATEGORY LIST HERE --- */}
            <div className="grid grid-cols-5 gap-x-2 gap-y-4 mb-8">
                {categories.map((cat) => (
                    <CategoryItem
                        key={cat.name}
                        name={cat.name}
                        Icon={cat.icon} // This is now safe, as it's Client Component to Client Component
                        isSelected={selectedCategory === cat.name && !searchQuery}
                    />
                ))}
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Skeletons are no longer needed here, the page fallback handles it */}
                <AnimatePresence>
                    {!loading && showUploadCard && (
                        <motion.div
                            key="upload-card"
                            variants={gridItemVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                        >
                            <UploadPrescriptionCard />
                        </motion.div>
                    )}

                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            ref={products.length === index + 1 ? lastProductElementRef : null}
                            variants={gridItemVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            layout
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {loadingMore && <Spinner />}

            {!loading && products.length === 0 && !showUploadCard && (
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