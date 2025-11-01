// components/modals/ProductDetailModal.tsx
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
import { useCart } from '@/store/CartContext';

export default function ProductDetailModal({ product, closeModal }: { product: Product, closeModal: () => void }) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();

    // This line is still broken. Send me CartContext.tsx to fix it.
    // const { refreshCart } = useCart(); 
    const { ...cartContext } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = new useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const addToCartUpsertAction = async () => {
        // ... (This function is correct, no changes) ...
        if (!session) {
            toast.error('Please login to continue.');
            closeModal();
            router.push('/login');
            return { success: false };
        }
        const { data: existingItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', product.id)
            .maybeSingle();
        if (fetchError) {
            toast.error(fetchError.message);
            return { success: false };
        }
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);
            if (error) { toast.error(`Error: ${error.message}`); return { success: false }; }
        } else {
            const { error } = await supabase.from('cart_items').insert({
                product_id: product.id,
                quantity,
                user_id: session.user.id,
            });
            if (error) { toast.error(`Error: ${error.message}`); return { success: false }; }
        }
        return { success: true };
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const { success } = await addToCartUpsertAction();

        if (success) {
            const toastId = toast.success(`${quantity} × ${product.name} added to cart!`);

            // console.log("CartContext needs to be refreshed!", cartContext);
            // refreshCart(); // This line is broken

            setTimeout(() => {
                toast.dismiss(toastId);

                // --- THIS IS THE FIX ---
                // We do NOT call closeModal().
                // router.push('/') will navigate AND close the modal.
                // closeModal(); // REMOVED THIS CONFLICTING LINE
                router.push('/');
                // ------------------------

            }, 1000);

            return;
        }

        setIsAdding(false);
    };

    const handleBuyNow = async () => {
        setIsBuying(true);
        // ... (This logic is correct, no change needed) ...
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
            setIsBuying(false);
            return;
        }
        if (!session) {
            closeModal();
            router.push('/login?redirect=' + encodeURIComponent('/checkout?buyNow=true'));
            return;
        }

        // This is also a redirect, so it will also close the modal.
        closeModal(); // We can keep this one or remove it, but router.push is better
        router.push(`/checkout?buyNow=true`);
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