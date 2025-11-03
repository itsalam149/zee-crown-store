// app/(main)/page.tsx
// NO 'use client' at the top

import { Suspense } from 'react';
import { Product, Banner } from '@/lib/types';
import BannerSlider from '@/components/ui/BannerSlider';
// Import only the component that is rendered *here*
import CategoryItem from '@/components/product/CategoryItem';
import { LayoutGrid, Pill, Droplet, Dumbbell, SprayCan } from 'lucide-react';
import Loading from './loading';
import ProductListClient from './ProductListClient'; // This is the new client component
import { createClient } from '@/lib/supabase-server'; // Use server client

const PRODUCTS_PER_PAGE = 10;

// --- THIS ARRAY IS NOW MOVED to ProductListClient.tsx ---
// const categories = [ ... ];

interface HomePageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

// 1. Make the component async and accept searchParams
async function HomePageContent({ searchParams }: HomePageProps) {
    // 1.a. Use the server client for data fetching
    const supabase = createClient();

    // 2. Get params from the prop, not hooks
    const selectedCategory = (searchParams?.category as string) || 'All';
    const searchQuery = (searchParams?.q as string) || '';

    // 3. Create the data-fetching functions
    const getBanners = () => {
        let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
        if (selectedCategory !== 'All') {
            bannerQuery = bannerQuery.in('category', [selectedCategory, 'All']);
        }
        return bannerQuery.order('sort_order');
    };

    const getProducts = () => {
        let productQuery = supabase.from('products').select('*').range(0, PRODUCTS_PER_PAGE - 1);
        if (selectedCategory !== 'All') {
            productQuery = productQuery.eq('category', selectedCategory);
        }
        if (searchQuery) {
            productQuery = productQuery.ilike('name', `%${searchQuery}%`);
        }
        return productQuery.order('created_at', { ascending: false });
    };

    // 4. Fetch data in parallel on the server
    const [bannerResult, productResult] = await Promise.all([
        getBanners(),
        getProducts()
    ]);

    const banners: Banner[] = bannerResult.data || [];
    const initialProducts: Product[] = productResult.data || [];

    const textColor = (selectedCategory === 'All' || searchQuery) ? 'text-dark-gray' : 'text-white';

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 space-y-6 pb-24">
            {!searchQuery && (
                <div className="mt-0">
                    {/* 5. Pass banners as a prop */}
                    <BannerSlider banners={banners} />
                </div>
            )}

            <div>
                {/* The categories list is now rendered inside ProductListClient,
                  so we remove it from here.
                */}

                {/* 6. Render the new Client Component with initial data */}
                <ProductListClient
                    initialProducts={initialProducts}
                    textColor={textColor}
                    selectedCategory={selectedCategory}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}

// 7. Wrap in Suspense because the main layout uses useSearchParams
export default function HomePage(props: HomePageProps) {
    return (
        <Suspense fallback={<Loading />}>
            <HomePageContent {...props} />
        </Suspense>
    );
}