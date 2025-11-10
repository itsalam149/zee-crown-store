'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import ProductDetailModal from '@/components/product/ProductDetailModal';

export default function ProductModal({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        setTimeout(() => router.back(), 100);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase.from('products').select('*').eq('id', params.slug).single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === dialogRef.current) handleClose();
    };

    return (
        <div
            ref={dialogRef}
            onClick={onBackdropClick}
            className="fixed inset-0 z-50 flex items-end justify-center"
        >
            <div 
                className="relative bg-white w-full rounded-t-2xl md:rounded-xl md:max-w-4xl md:mb-8 shadow-lifted"
                style={{
                    animation: 'slideUp 0.3s ease-out',
                    maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 p-2 md:hidden">
                    <div className="w-12 h-1.5 bg-white/70 rounded-full" />
                </div>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-30 bg-gray-100 rounded-full p-1 text-gray-700 hover:bg-red hover:text-white transition-colors hidden md:block"
                >
                    <X size={20} />
                </button>

                {product && (
                    <ProductDetailModal product={product} closeModal={handleClose} />
                )}
                {!product && (
                    <div className="flex items-center justify-center w-full h-[70vh] md:h-auto">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
}