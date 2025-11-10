// app/(main)/page.tsx

import { Suspense } from 'react';
import { Banner, ProductCardType } from '@/lib/types';
import BannerSliderWrapper from '@/components/ui/BannerSliderWrapper';
import Loading from './loading';
import ProductListClient from './ProductListClient';
import { createClient } from '@/lib/supabase-server';
import { unstable_noStore as noStore } from 'next/cache';

// CRITICAL FIX: This forces the page to be dynamic and re-fetch on navigation
export const dynamic = 'force-dynamic';

const PRODUCTS_PER_PAGE = 10;

interface HomePageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

// Function to get the absolute URL for fetching (needed for server-side fetch)
function getAbsoluteURL(path: string) {
    const baseURL = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || 3000}`;
    return `${baseURL}${path}`;
}

// This function fetches all data for the page
async function getPageData(category: string, query: string) {
    noStore(); // Ensures searchParams are re-evaluated
    const supabase = createClient();

    // 1. Fetch Banners
    const getBanners = () => {
        let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
        if (category !== 'All') {
            bannerQuery = bannerQuery.in('category', [category, 'All']);
        }
        return bannerQuery.order('sort_order');
    };

    // 2. Fetch Products from our API route
    const getProducts = async (): Promise<{ products: ProductCardType[], hasMore: boolean }> => {
        const params = new URLSearchParams({
            category: category,
            q: query,
            page: '0',
        });

        const url = getAbsoluteURL(`/api/products?${params.toString()}`);

        try {
            // Tell Next.js not to cache the result of this fetch
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) {
                console.error("Failed to fetch products:", await res.text());
                return { products: [], hasMore: false };
            }
            return res.json();
        } catch (error) {
            console.error("Error in getProducts fetch:", error);
            return { products: [], hasMore: false };
        }
    };

    const [bannerResult, productData] = await Promise.all([
        getBanners(),
        getProducts()
    ]);

    return {
        banners: bannerResult.data || [],
        initialProducts: productData.products || [],
        hasMore: productData.hasMore || false,
    };
}

async function HomePageContent({ searchParams }: HomePageProps) {
    const selectedCategory = (searchParams?.category as string) || 'All';
    const searchQuery = (searchParams?.q as string) || '';

    // This data is now fresh on every navigation
    const { banners, initialProducts, hasMore } = await getPageData(selectedCategory, searchQuery);

    const textColor = (selectedCategory === 'All' || searchQuery) ? 'text-dark-gray' : 'text-white';

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 space-y-6 pb-24">
            {!searchQuery && (
                <div className="mt-0">
                    <BannerSliderWrapper banners={banners} />
                </div>
            )}

            <div>
                <ProductListClient
                    initialProducts={initialProducts}
                    initialHasMore={hasMore}
                    textColor={textColor}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}

// This export is a standard (non-async) React component
export default function HomePage(props: HomePageProps) {
    return (
        <Suspense fallback={<Loading />}>
            <HomePageContent {...props} />
        </Suspense>
    );
}