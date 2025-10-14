'use client';
import { createClient } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import ProductDetailClient from '@/app/product/ProductDetailClient';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';

export default function ProductModal({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const supabase = createClient();
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.slug)
                .single();
            setProduct(data);
        };
        fetchProduct();
    }, [params.slug, supabase]);

    const handleClose = () => {
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute -top-10 right-0 text-white hover:text-primary transition-colors">
                    <X size={32} />
                </button>
                {product ? <ProductDetailClient product={product} /> : <div className="bg-white h-96 rounded-lg animate-pulse" />}
            </div>
        </div>
    );
}