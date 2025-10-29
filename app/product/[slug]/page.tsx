import { createClient } from '@/lib/supabase-server'; // Use the server client for Server Components
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient'; // We will use a new client component

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();

    // Fetch the product data on the server
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.slug)
        .single();

    // If no product is found, show a 404 page
    if (!product) {
        notFound();
    }

    // Render the client component with the fetched product data
    return <ProductPageClient product={product} />;
}