// components/product/ProductDetailModal.tsx
'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
import { useCart } from '@/store/CartContext'; // Make sure this path is correct

export default function ProductDetailModal({ product, closeModal }: { product: Product, closeModal: () => void }) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();

    // This is correct
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const handleAddToCart = async () => {
        setIsAdding(true);
        if (!session) {
            toast.error('Please login to continue.');
            closeModal();
            router.push('/login');
            setIsAdding(false); // Stop loading on redirect
            return;
        }

        // Call the context function. It will handle the Supabase logic.
        await addToCart(product.id, quantity);

        const toastId = toast.success(`${quantity} × ${product.name} added to cart!`);

        // After 1 second (matching your global config), dismiss toast and close modal.
        setTimeout(() => {
            toast.dismiss(toastId);
            closeModal(); // This is correct, this function calls router.back()
        }, 1000);

        // No need to set isAdding(false), as the component will unmount
    };

    const handleBuyNow = async () => {
        setIsBuying(true);

        // 1. Set item for checkout page
        try {
            const buyNowItem = {
                product_id: product.id,
                quantity,
                products: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    mrp: product.mrp,
                },
            };
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
        } catch (e) {
            console.error('Failed to store Buy Now item:', e);
            toast.error('Could not proceed to checkout. Please try again.');
            setIsBuying(false); // Reset button on error
            return;
        }

        // 2. Define the URL
        const checkoutUrl = `/checkout?buyNow=true`;

        // 3. Check session and create redirect URL if needed
        if (!session) {
            const redirectUrl = encodeURIComponent(checkoutUrl);

            // ** THE FIX **
            // Call closeModal() to start the exit animation.
            closeModal();
            // This push will override the router.back() in closeModal.
            router.push(`/login?redirect=${redirectUrl}`);
            return;
        }

        // ** THE FIX **
        // 1. Call closeModal() FIRST. This starts the modal's exit animation
        //    and schedules its router.back().
        closeModal();

        // 2. Call router.push() SECOND. This *overrides* the pending
        //    router.back() and navigates to the checkout page instead.
        router.push(checkoutUrl);

        // The component will unmount, so no need to set isBuying(false).
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
            <div className="relative w-full aspect-square md:aspect-auto">
                <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
            </div>
            <div className="flex flex-col p-6 md:p-8 bg-white overflow-hidden">
                <div className="flex-shrink-0">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                    <h1 className="text-2xl lg:text-3xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                    <div className="flex items-baseline gap-3 mt-4">
                        <p className="text-3xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <div className="text-sm font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">{discount}% OFF</div>}
                    </div>
                </div>
                <div className="flex-grow my-6 pr-4 -mr-4 overflow-y-auto">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex-shrink-0 mt-auto pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-dark-gray">Quantity:</p>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full"><Minus size={16} /></button>
                            <p className="text-lg font-bold w-8 text-center">{quantity}</p>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full"><Plus size={16} /></button>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <Button
                            onClick={handleAddToCart}
                            disabled={isAdding || isBuying}
                            className="flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                            <ShoppingCart size={20} />
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </Button>
                        <Button onClick={handleBuyNow} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2">
                            <Zap size={20} />
                            {isBuying ? 'Proceeding...' : 'Buy Now'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}