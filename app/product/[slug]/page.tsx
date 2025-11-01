'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // <-- 1. Import usePathname
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import ProductDetailModal from '@/components/product/ProductDetailModal';

export default function ProductModal({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const pathname = usePathname(); // <-- 2. Get the current pathname
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);
    const [show, setShow] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    const handleClose = () => {
        setShow(false);
        // This delay allows the closing animation to finish before navigating back
        setTimeout(() => router.back(), 300);
    };

    useEffect(() => {
        setShow(true);
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- 3. THIS IS THE FIX ---
    // This effect listens for changes in the URL.
    // If the URL no longer matches the product's slug (e.g., you've
    // navigated to '/checkout'), it will trigger the modal to close.
    useEffect(() => {
        if (show && !pathname.includes(`/product/${params.slug}`)) {
            setShow(false);
            // We don't call router.back() here, just close the modal UI
            // as the router has already moved on.
        }
    }, [pathname, params.slug, show]);
    // -------------------------

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === dialogRef.current) handleClose();
    };

    return (
        <div
            ref={dialogRef}
            onClick={onBackdropClick}
            className={`fixed inset-0 z-50 flex items-end md:items-center justify-center transition-colors duration-300 ease-in-out ${show ? 'bg-black/50' : 'bg-transparent'}`}
        >
            <div
                className={`relative bg-white w-full rounded-t-2xl md:rounded-xl shadow-lifted max-w-4xl transition-transform duration-300 ease-out-expo ${show ? 'translate-y-0' : 'translate-y-full md:translate-y-10'}`}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 p-2 md:hidden">
                    <div className="w-12 h-1.5 bg-white/70 rounded-full" />
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 bg-gray-100 rounded-full p-1 text-gray-700 hover:bg-red hover:text-white hover:scale-110 transition-all duration-200 hidden md:block"
                >
                    <X size={20} />
                </button>

                {product ? (
                    // Pass the handleClose function down to the child
                    // The "Buy Now" button in this child component will
                    // now work, because this parent will detect the URL change.
                    <ProductDetailModal product={product} closeModal={handleClose} />
                ) : (
                    <div className="flex items-center justify-center w-full h-[70vh] md:h-auto">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}