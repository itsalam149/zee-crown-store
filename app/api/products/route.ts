// app/api/products/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PRODUCTS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const selectedCategory = searchParams.get('category') || 'All';
        const searchQuery = searchParams.get('q') || '';
        const page = parseInt(searchParams.get('page') || '0', 10);

        const from = page * PRODUCTS_PER_PAGE;
        const to = from + PRODUCTS_PER_PAGE - 1;

        const supabase = createClient();
        let queryBuilder = supabase
            .from('products')
            // Select only the fields for ProductCardType
            .select('id, name, price, mrp, image_url, category')
            .range(from, to);

        if (selectedCategory !== 'All') {
            queryBuilder = queryBuilder.eq('category', selectedCategory);
        }
        if (searchQuery) {
            queryBuilder = queryBuilder.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await queryBuilder.order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            products: data,
            hasMore: data.length === PRODUCTS_PER_PAGE
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}