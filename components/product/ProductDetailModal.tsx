'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react';

export default function ProductDetailModal({ product, closeModal }: { product: Product, closeModal: () => void }) {
    // ... All logic (handleAddToCart, handleBuyNow, etc.) remains the same
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const addToCart = async () => {
        if (!session) { toast.error('Please login to continue.'); closeModal(); router.push('/login'); return { success: false }; }
        const { error } = await supabase.from('cart_items').insert({ product_id: product.id, quantity: quantity, user_id: session.user.id, });
        if (error) { toast.error('Error: ' + error.message); return { success: false }; }
        router.refresh();
        return { success: true };
    };
    const handleAddToCart = async () => {
        setIsAdding(true);
        const toastId = toast.loading('Adding to cart...');
        const { success } = await addToCart();
        toast.dismiss(toastId);
        if (success) toast.success(`${quantity} of ${product.name} added to cart!`);
        setIsAdding(false);
    };
    const handleBuyNow = async () => {
        setIsBuying(true);
        const toastId = toast.loading('Preparing your order...');
        const { success } = await addToCart();
        toast.dismiss(toastId);
        if (success) { closeModal(); router.push('/checkout'); }
        setIsBuying(false);
    };

    // This layout is now designed to fit perfectly inside the new mobile-first modal
    return (
        <div className="flex flex-col max-h-[85vh]">
            {/* On mobile, this header is part of the scroll. On desktop, it's fixed. */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-72 flex-shrink-0">
                <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} className="md:rounded-t-xl" priority />
            </div>

            {/* This container handles scrolling for all content below the image */}
            <div className="flex flex-col flex-grow p-6 overflow-y-auto">
                <div className="flex-shrink-0">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                    <div className="flex items-baseline gap-3 mt-3">
                        <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-lg text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <div className="text-xs font-bold bg-red-100 text-red px-2 py-1 rounded-md">{discount}% OFF</div>}
                    </div>
                </div>

                <div className="my-4 border-t border-lighter-gray"></div>

                <div className="text-gray leading-relaxed text-sm">
                    <h3 className="font-bold text-dark-gray mb-2">Description</h3>
                    <p>{product.description}</p>
                </div>
            </div>

            {/* This is the "sticky footer" for actions, always visible at the bottom */}
            <div className="flex-shrink-0 p-6 border-t border-lighter-gray bg-white">
                <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-dark-gray">Quantity:</p>
                    <div className="flex items-center gap-1 bg-grayBG rounded-full">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-gray hover:text-primary transition-colors rounded-full"><Minus size={16} /></button>
                        <p className="text-base font-bold w-8 text-center">{quantity}</p>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-gray hover:text-primary transition-colors rounded-full"><Plus size={16} /></button>
                    </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button onClick={handleAddToCart} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2 bg-lightPrimary text-primary hover:bg-light">
                        <ShoppingCart size={18} />
                        {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                    <Button onClick={handleBuyNow} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2">
                        <Zap size={18} />
                        {isBuying ? 'Redirecting...' : 'Buy Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
}