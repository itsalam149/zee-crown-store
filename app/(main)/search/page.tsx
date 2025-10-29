'use client'

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Product } from '@/lib/types';
import ProductCard from '@/components/product/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

export default function SearchPage() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`);

            setProducts(data || []);
            setLoading(false);
        };

        fetchProducts();
    }, [query, supabase]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                Search Results for "{query}"
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {loading
                    ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
            {!loading && products.length === 0 && (
                <p className="text-center py-12 text-gray-500">No products found for your search.</p>
            )}
        </div>
    )
}