import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { Plus } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    return (
        <Link
            href={`/product/${product.id}`}
            scroll={false}
            className="group block rounded-xl overflow-hidden bg-white shadow-subtle transition-all duration-300 ease-out-expo hover:shadow-medium hover:-translate-y-1"
        >
            <div className="relative w-full aspect-square overflow-hidden">
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {discount}% OFF
                    </div>
                )}
                <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 ease-out-expo group-hover:scale-105"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-dark-gray">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                    <div>
                        <span className="text-base font-bold text-primary">₹{product.price}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
                        )}
                    </div>
                    <div className="bg-lighter-gray p-1.5 rounded-full text-dark-gray transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-hover:bg-primary md:group-hover:text-white">
                        <Plus size={16} />
                    </div>
                </div>
            </div>
        </Link>
    );
}