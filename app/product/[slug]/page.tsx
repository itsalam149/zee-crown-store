'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import ProductDetailModal from '@/components/product/ProductDetailModal';

export default function ProductModal({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);
    const [show, setShow] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    const handleClose = () => {
        if (isNavigating) return; // Prevent double navigation
        setShow(false);
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

    // Detect route changes and close modal
    useEffect(() => {
        // If pathname changes to something other than the current product, hide the modal
        if (show && !pathname.includes(`/product/${params.slug}`)) {
            console.log('Route changed, closing modal');
            setShow(false);
            document.body.style.overflow = 'auto';
        }
    }, [pathname, params.slug, show]);

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === dialogRef.current) handleClose();
    };

    // Don't render if navigating away
    if (!show && !pathname.includes(`/product/${params.slug}`)) {
        return null;
    }

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
                    <ProductDetailModal
                        product={product}
                        closeModal={handleClose}
                        onNavigate={() => setIsNavigating(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-[70vh] md:h-auto">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}