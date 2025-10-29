// app/(main)/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react'; // Added Suspense
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
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import Loading from './loading'; // Import the Loading component

const PRODUCTS_PER_PAGE = 10;

const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'medicine', icon: Pill },
    { name: 'cosmetics', icon: Droplet },
    { name: 'food', icon: Dumbbell },
    { name: 'perfumes', icon: SprayCan },
];

// --- Adjusted Animation Variants ---
const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04, // Slightly faster stagger for smoother feel
            delayChildren: 0.1, // Small delay before starting
        },
    },
};

const gridItemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 }, // Start slightly scaled down
    show: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 12 } // Spring animation
    },
    exit: { // Define exit animation
        y: -10,
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.2 }
    }
};
// ------------------------------------


// Wrap the main component logic to use Suspense for searchParams
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

    // Get category and search query from URL
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
            // Apply search filter here as well for loading more
            queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }

        const { data: newProducts } = await queryBuilder.order('created_at', { ascending: false });

        if (newProducts && newProducts.length > 0) {
            // Use functional update to ensure correct state based on previous state
            setProducts(prev => [...prev, ...newProducts]);
            setPage(prev => prev + 1);
            if (newProducts.length < PRODUCTS_PER_PAGE) setHasMore(false);
        } else {
            setHasMore(false);
        }
        setLoadingMore(false);
    }, [page, hasMore, loadingMore, selectedCategory, searchQuery, supabase]);

    const lastProductElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return; // Prevent attaching observer while initial loading
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            // Only load more if intersecting, there's more data, and not already loading more
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                // console.log("Intersecting, loading more..."); // Optional: for debugging
                loadMoreProducts();
            }
        }, { threshold: 0.5 }); // Trigger when 50% visible
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMoreProducts, loadingMore]);

    // Effect to fetch initial data OR refetch when category/search changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setPage(1); // Reset page number on new search/category
            setHasMore(true); // Assume there might be more pages initially
            setProducts([]); // Clear existing products immediately for visual feedback

            // Fetch Banners (only depends on category)
            let bannerQuery = supabase.from('banners').select('*').eq('is_active', true);
            if (selectedCategory !== 'All') {
                bannerQuery = bannerQuery.in('category', [selectedCategory, 'All']);
            }
            const { data: bannerData } = await bannerQuery.order('sort_order');
            setBanners(bannerData || []);

            // Fetch Products (depends on category AND search query)
            let productQuery = supabase.from('products').select('*').range(0, PRODUCTS_PER_PAGE - 1);
            if (selectedCategory !== 'All') {
                productQuery = productQuery.eq('category', selectedCategory);
            }
            // --- Apply search query filter ---
            if (searchQuery) {
                productQuery = productQuery.ilike('name', `%${searchQuery}%`);
            }
            // ---------------------------------
            const { data: productData } = await productQuery.order('created_at', { ascending: false });

            setProducts(productData || []);
            if (!productData || productData.length < PRODUCTS_PER_PAGE) {
                setHasMore(false); // No more pages if initial fetch is less than limit
            }
            setLoading(false);
        };
        fetchData();
        // Dependency array includes category AND search query now
    }, [selectedCategory, searchQuery, supabase]);

    const textColor = selectedCategory !== 'All' ? 'text-white' : 'text-dark-gray';
    // Only show upload card if NOT searching and in relevant categories
    const showUploadCard = !searchQuery && (selectedCategory === 'All' || selectedCategory === 'medicine');
    // Determine heading based on search or category
    const pageTitle = searchQuery ? `Results for "${searchQuery}"` : (selectedCategory === 'All' ? 'Featured Products' : selectedCategory);

    return (
        <div className="space-y-6 pb-24">

            {/* Banner is now always visible, unless searching */}
            {!searchQuery && (
                <div className="mb-6">
                    <BannerSlider banners={banners} />
                </div>
            )}

            <div>
                {/* Categories - Hide if searching? Or keep visible? Let's keep visible for now. */}
                <div className="grid grid-cols-5 gap-x-2 gap-y-4 mb-8">
                    {categories.map((cat) => (
                        <CategoryItem
                            key={cat.name}
                            name={cat.name}
                            Icon={cat.icon}
                            isSelected={selectedCategory === cat.name && !searchQuery} // Deselect category visually if searching
                        />
                    ))}
                </div>

                {/* --- Dynamic Title --- */}
                <div className="border-t border-white/10 pt-8 mb-8">
                    <h2
                        className={cn(
                            'text-2xl md:text-3xl font-bold text-center capitalize transition-colors duration-500',
                            textColor
                        )}
                    >
                        {pageTitle}
                    </h2>
                </div>
                {/* --------------------- */}

                {/* --- Product Grid with AnimatePresence --- */}
                <motion.div
                    key={selectedCategory + searchQuery} // Key ensures animation runs on filter change
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {/* --- Skeletons --- */}
                    {loading && Array.from({ length: 10 }).map((_, i) => (
                        // Wrap skeleton in motion.div if you want them to animate in too
                        // <motion.div key={`skel-${i}`} variants={gridItemVariants} layout>
                        <ProductCardSkeleton key={`skel-${i}`} />
                        // </motion.div>
                    ))}

                    {/* --- Actual Products --- */}
                    {!loading && (
                        <AnimatePresence> {/* Wrap products map */}
                            {showUploadCard && (
                                <motion.div
                                    key="upload-card" // Unique key for AnimatePresence
                                    variants={gridItemVariants}
                                    initial="hidden" // Ensure it animates in with others
                                    animate="show"
                                    exit="exit" // Use exit variant
                                    layout
                                >
                                    <UploadPrescriptionCard />
                                </motion.div>
                            )}
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id} // Use product ID as key
                                    ref={products.length === index + 1 ? lastProductElementRef : null}
                                    variants={gridItemVariants}
                                    // initial="hidden" // Handled by parent container stagger
                                    // animate="show" // Handled by parent container stagger
                                    exit="exit" // Use the defined exit animation
                                    layout // Smoothly animates position changes
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </motion.div>
                {/* ------------------------------------------- */}


                {/* Loading spinner for loading more */}
                {loadingMore && <Spinner />}

                {/* No Results Message */}
                {!loading && products.length === 0 && (
                    <div className="col-span-full text-center py-16 flex flex-col items-center">
                        <PackageSearch size={64} className={cn('transition-colors duration-500', selectedCategory !== 'All' ? 'text-white/50' : 'text-gray-300')} />
                        <h3 className={cn("text-2xl font-bold mt-4 transition-colors duration-500", textColor)}>
                            {searchQuery ? 'No Products Match Your Search' : 'No Products Found'}
                        </h3>
                        <p className={cn("mt-2 transition-colors duration-500", selectedCategory !== 'All' ? 'text-white/70' : 'text-gray-500')}>
                            Try adjusting your category{searchQuery ? ' or search term' : ''}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export default component wrapped in Suspense
export default function HomePage() {
    return (
        <Suspense fallback={<Loading />}> {/* Use your existing Loading component */}
            <HomePageContent />
        </Suspense>
    )
}