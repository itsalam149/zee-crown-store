// app/(main)/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product, Banner } from '@/lib/types';
import BannerSlider from '@/components/ui/BannerSlider';
import CategoryItem from '@/components/product/CategoryItem';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan, PackageSearch } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from './loading';

const PRODUCTS_PER_PAGE = 10;

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const gridItemVariants = {
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

function HomePageContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver>();

    const selectedCategory = useMemo(() => searchParams.get('category') || 'All', [searchParams]);
    const searchQuery = useMemo(() => searchParams.get('q') || '', [searchParams]);

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setPage(1);
            setHasMore(true);
            setProducts([]);

            let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
            if (selectedCategory !== 'All') {
                bannerQuery = bannerQuery.in('category', [selectedCategory, 'All']);
            }
            const { data: bannerData } = await bannerQuery.order('sort_order');
            setBanners(bannerData || []);

            let productQuery = supabase.from('products').select('*').range(0, PRODUCTS_PER_PAGE - 1);
            if (selectedCategory !== 'All') {
                productQuery = productQuery.eq('category', selectedCategory);
            }
            if (searchQuery) {
                productQuery = productQuery.ilike('name', `%${searchQuery}%`);
            }
            const { data: productData } = await productQuery.order('created_at', { ascending: false });

            setProducts(productData || []);
            if (!productData || productData.length < PRODUCTS_PER_PAGE) {
                setHasMore(false);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedCategory, searchQuery, supabase]);

    const textColor = 'text-dark-gray';
    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');
    const pageTitle = searchQuery
        ? `Results for "${searchQuery}"`
        : selectedCategory === 'All'
            ? 'Featured Products'
            : selectedCategory;

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 space-y-6 pb-24">

            {/* ✅ FIX: Removed top padding (no gap above banner) */}
            {!searchQuery && (
                <div className="mt-0">
                    <BannerSlider banners={banners} />
                </div>
            )}

            <div>
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

                <div className="border-t border-gray-200 pt-8 mb-8">
                    <h2
                        className={cn(
                            'text-2xl md:text-3xl font-bold text-center capitalize transition-colors duration-500',
                            textColor
                        )}
                    >
                        {pageTitle}
                    </h2>
                </div>

                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {loading && products.length === 0 &&
                        Array.from({ length: 10 }).map((_, i) => (
                            <ProductCardSkeleton key={`skel-${i}`} />
                        ))}

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
                        <PackageSearch size={64} className="text-gray-300" />
                        <h3 className={cn('text-2xl font-bold mt-4', textColor)}>
                            {searchQuery ? 'No Products Match Your Search' : 'No Products Found'}
                        </h3>
                        <p className={cn('mt-2 text-gray-500')}>
                            Try adjusting your category{searchQuery ? ' or search term' : ''}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<Loading />}>
            <HomePageContent />
        </Suspense>
    );
}
