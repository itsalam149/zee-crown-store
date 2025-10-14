import { createClient } from '@/lib/supabase-client';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// This page will render when a product URL is accessed directly
export default async function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.slug)
        .single();

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}