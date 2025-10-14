'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product, Banner } from '@/lib/types';
import BannerSlider from '@/components/ui/BannerSlider';
import CategoryItem from '@/components/product/CategoryItem';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { SearchBar } from '@/components/ui/SearchBar';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan, PackageSearch } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const PRODUCTS_PER_PAGE = 10;

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

export default function HomePage() {
    // ... (All data fetching logic remains the same)
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
        let query = supabase.from('products').select('*').range(from, to);
        if (selectedCategory !== 'All') query = query.eq('category', selectedCategory);
        if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
        const { data: newProducts } = await query.order('created_at', { ascending: false });
        if (newProducts && newProducts.length > 0) {
            setProducts(prev => [...prev, ...newProducts]);
            setPage(prev => prev + 1);
            if (newProducts.length < PRODUCTS_PER_PAGE) setHasMore(false);
        } else { setHasMore(false); }
        setLoadingMore(false);
    }, [page, hasMore, loadingMore, selectedCategory, searchQuery, supabase]);

    const lastProductElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) { loadMoreProducts(); }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMoreProducts, loadingMore]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); setPage(1); setHasMore(true);
            let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
            if (selectedCategory !== 'All') bannerQuery = bannerQuery.in('category', [selectedCategory, 'All']);
            const { data: bannerData } = await bannerQuery.order('sort_order');
            setBanners(bannerData || []);
            let productQuery = supabase.from('products').select('*').range(0, PRODUCTS_PER_PAGE - 1);
            if (selectedCategory !== 'All') productQuery = productQuery.eq('category', selectedCategory);
            if (searchQuery) productQuery = productQuery.ilike('name', `%${searchQuery}%`);
            const { data: productData } = await productQuery.order('created_at', { ascending: false });
            setProducts(productData || []);
            if (!productData || productData.length < PRODUCTS_PER_PAGE) setHasMore(false);
            setLoading(false);
        };
        fetchData();
    }, [selectedCategory, searchQuery, supabase]);

    // Conditional text color for dark backgrounds
    const textColor = selectedCategory !== 'All' ? 'text-white' : 'text-dark-gray';

    return (
        <div className="space-y-12 pb-24">

            <div className="max-w-xl mx-auto"><SearchBar /></div>

            <BannerSlider banners={banners} />

            {/* FULL-WIDTH GRID FOR CATEGORIES ON MOBILE */}
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                {categories.map((cat, index) => (
                    <div key={cat.name} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <CategoryItem name={cat.name} Icon={cat.icon} isSelected={selectedCategory === cat.name} />
                    </div>
                ))}
            </div>

            <div className="border-t border-white/10 pt-12">
                <h2 className={cn("text-3xl font-bold text-center capitalize transition-colors duration-500", textColor)}>
                    {selectedCategory === 'All' ? "Featured Products" : `${selectedCategory}`}
                </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {loading
                    ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : products.map((product, index) => (
                        <div ref={products.length === index + 1 ? lastProductElementRef : null} key={product.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <ProductCard product={product} />
                        </div>
                    ))
                }
            </div>
            {loadingMore && <Spinner />}
            {!loading && products.length === 0 && (
                <div className="col-span-full text-center py-16 flex flex-col items-center">
                    <PackageSearch size={64} className={cn("transition-colors duration-500", selectedCategory !== 'All' ? 'text-white/50' : 'text-gray-300')} />
                    <h3 className={cn("text-2xl font-bold mt-4 transition-colors duration-500", textColor)}>No Products Found</h3>
                    <p className={cn("mt-2 transition-colors duration-500", selectedCategory !== 'All' ? 'text-white/70' : 'text-gray-500')}>Try adjusting your category or search.</p>
                </div>
            )}
        </div>
    );
}