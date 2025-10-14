'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ProductDetailClient({ product }: { product: Product }) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const handleAddToCart = async () => {
        setLoading(true);
        // This is a placeholder for your "add to cart" logic
        alert(`${quantity} of ${product.name} added to cart! (simulation)`);
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative w-full aspect-square">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div className="p-6 flex flex-col">
                    <h1 className="text-3xl font-bold text-dark-gray">{product.name}</h1>
                    <p className="text-md text-gray-500 mt-2">{product.category}</p>

                    <div className="flex items-baseline gap-3 mt-4">
                        <p className="text-3xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && (
                            <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>
                        )}
                        {discount > 0 && (
                            <div className="text-md font-bold text-green-600">{discount}% OFF</div>
                        )}
                    </div>

                    <p className="text-gray-600 mt-4 flex-grow">{product.description}</p>

                    <div className="flex items-center justify-between mt-6">
                        <p className="text-lg font-semibold">Quantity:</p>
                        <div className="flex items-center gap-4 bg-grayBG rounded-full px-4 py-2">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg font-bold text-primary">-</button>
                            <p className="text-lg font-bold">{quantity}</p>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-lg font-bold text-primary">+</button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleAddToCart} disabled={loading}>
                            {loading ? 'Adding...' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}