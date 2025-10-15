'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

const PRODUCTS_PER_PAGE = 10;

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

export default function HomePage() {
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

    const textColor = selectedCategory !== 'All' ? 'text-white' : 'text-dark-gray';
    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');

    return (
        <div className="space-y-6 pb-24">
            {/* Search bar removed from here */}

            {/* Banner is now always visible */}
            <div className="mb-6">
                <BannerSlider banners={banners} />
            </div>

            <div>
                <div className="grid grid-cols-5 gap-x-2 gap-y-4 mb-8">
                    {categories.map((cat) => (
                        <CategoryItem key={cat.name} name={cat.name} Icon={cat.icon} isSelected={selectedCategory === cat.name} />
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {loading
                        ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : (
                            <>
                                {showUploadCard && (
                                    <div className="opacity-0 animate-fade-in-up">
                                        <UploadPrescriptionCard />
                                    </div>
                                )}
                                {products.map((product, index) => (
                                    <div ref={products.length === index + 1 ? lastProductElementRef : null} key={product.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </>
                        )
                    }
                </div>
                {loadingMore && <Spinner />}
                {!loading && products.length === 0 && (
                    <div className="col-span-full text-center py-16 flex flex-col items-center">
                        <PackageSearch size={64} className={cn(selectedCategory !== 'All' ? 'text-white/50' : 'text-gray-300')} />
                        <h3 className={cn("text-2xl font-bold mt-4", textColor)}>No Products Found</h3>
                        <p className={cn("mt-2", selectedCategory !== 'All' ? 'text-white/70' : 'text-gray-500')}>Try adjusting your category or search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}