'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product, Banner } from '@/lib/types';
import BannerSlider from '@/components/ui/BannerSlider';
import CategoryItem from '@/components/product/CategoryItem';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { SearchBar } from '@/components/ui/SearchBar';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import UploadPrescriptionCard from '@/components/ui/UploadPrescriptionCard';

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

    const selectedCategory = useMemo(() => searchParams.get('category') || 'All', [searchParams]);
    const searchQuery = useMemo(() => searchParams.get('q') || '', [searchParams]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
            if (selectedCategory !== 'All') {
                bannerQuery = bannerQuery.in('category', [selectedCategory, 'All']);
            }
            const { data: bannerData } = await bannerQuery.order('sort_order');
            setBanners(bannerData || []);

            let productQuery = supabase.from('products').select('*');
            if (selectedCategory !== 'All') {
                productQuery = productQuery.eq('category', selectedCategory);
            }
            if (searchQuery) {
                productQuery = productQuery.ilike('name', `%${searchQuery}%`);
            }
            const { data: productData } = await productQuery.order('id', { ascending: false }).limit(20);
            setProducts(productData || []);

            setLoading(false);
        };

        fetchData();
    }, [selectedCategory, searchQuery, supabase]);

    return (
        <div className="space-y-6 pb-12">
            <div className="max-w-xl mx-auto">
                <SearchBar initialQuery={searchQuery} />
            </div>
            <BannerSlider banners={banners} />

            <div className="flex justify-center items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2 -mx-4 px-4">
                {categories.map((cat) => (
                    <CategoryItem
                        key={cat.name}
                        name={cat.name}
                        Icon={cat.icon}
                        isSelected={selectedCategory === cat.name}
                    />
                ))}
            </div>

            <h2 className="text-2xl font-bold text-center capitalize">
                {selectedCategory === 'All' ? "Featured Products" : `${selectedCategory} Products`}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {loading
                    ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : <>
                        {(selectedCategory === 'All' || selectedCategory === 'medicine') && <UploadPrescriptionCard />}
                        {products.map((product) => <ProductCard key={product.id} product={product} />)}
                    </>
                }
            </div>
            {!loading && products.length === 0 && (
                <div className="text-center py-12 text-gray-500 col-span-full">
                    <p>No products found for this category.</p>
                </div>
            )}
        </div>
    );
}