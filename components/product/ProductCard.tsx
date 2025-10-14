import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    return (
        <Link href={`/product/${product.id}`} scroll={false} className="group block border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
            <div className="relative w-full aspect-square overflow-hidden">
                <Image
                    src={product.image_url}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                />
            </div>
            <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-dark-gray">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-md font-bold text-primary">₹{product.price}</p>
                    {product.mrp && product.mrp > product.price && (
                        <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
                    )}
                </div>
                {discount > 0 && (
                    <div className="text-xs font-bold text-green-600 mt-1">{discount}% OFF</div>
                )}
            </div>
        </Link>
    );
}