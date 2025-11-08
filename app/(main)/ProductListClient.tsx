// app/(main)/ProductListClient.tsx
'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ProductCardType } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import { PackageSearch } from 'lucide-react';
import CategoryItem from '@/components/product/CategoryItem';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

interface ProductListClientProps {
    initialProducts: ProductCardType[];
    initialHasMore: boolean;
    textColor: string;
    selectedCategory: string;
    searchQuery: string;
}

// Memoized to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);
const MemoizedUploadCard = memo(UploadPrescriptionCard);

export default function ProductListClient({
    initialProducts,
    initialHasMore,
    textColor,
    selectedCategory,
    searchQuery
}: ProductListClientProps) {

    const [products, setProducts] = useState<ProductCardType[]>(initialProducts);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false); // Prevent double-loading

    // Reset when filters change
    useEffect(() => {
        setProducts(initialProducts);
        setPage(0);
        setHasMore(initialHasMore);
        setLoading(false);
        loadingRef.current = false;
    }, [selectedCategory, searchQuery, initialProducts, initialHasMore]);

    // Load more products
    const loadMore = useCallback(async () => {
        // Double-check with ref to prevent race conditions
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        const nextPage = page + 1;
        setLoading(true);

        try {
            const params = new URLSearchParams({
                category: selectedCategory,
                q: searchQuery,
                page: nextPage.toString(),
            });

            const res = await fetch(`/api/products?${params}`, {
                cache: 'no-store',
                priority: 'high' // Prioritize this fetch
            });

            if (!res.ok) throw new Error('Fetch failed');

            const data = await res.json();

            if (data.products?.length > 0) {
                // Use functional update for better performance
                setProducts(prev => [...prev, ...data.products]);
                setPage(nextPage);
                setHasMore(data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Load error:', err);
            setHasMore(false);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [hasMore, page, selectedCategory, searchQuery]);

    // Intersection Observer with better threshold
    useEffect(() => {
        const target = observerTarget.current;
        if (!target || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingRef.current) {
                    loadMore();
                }
            },
            {
                rootMargin: '200px', // Load early
                threshold: 0
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMore, hasMore]);

    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div className="space-y-6">
            {/* Categories - No animation */}
            <div className="grid grid-cols-5 gap-x-2 gap-y-4">
                {categories.map((cat) => (
                    <CategoryItem
                        key={cat.name}
                        name={cat.name}
                        Icon={cat.icon}
                        isSelected={selectedCategory === cat.name && !searchQuery}
                    />
                ))}
            </div>

            {/* Products Grid - Minimal animations */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {showUploadCard && <MemoizedUploadCard />}

                {products.map((product) => (
                    <MemoizedProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
                <div
                    ref={observerTarget}
                    className="h-20 flex items-center justify-center"
                    style={{ minHeight: '80px' }} // Prevent layout shift
                >
                    {loading && <Spinner />}
                </div>
            )}

            {/* Empty State - Only show if no loading */}
            {products.length === 0 && !loading && (
                <div className="text-center py-16 space-y-4">
                    <PackageSearch size={48} className={cn(textColor === 'text-white' ? 'text-white/50' : 'text-gray-300')} />
                    <div>
                        <h3 className={cn('text-xl font-bold', textColor)}>
                            No Products Found
                        </h3>
                        <p className={cn('mt-2 text-sm', textColor === 'text-white' ? 'text-white/70' : 'text-gray-500')}>
                            Try adjusting your filters
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}