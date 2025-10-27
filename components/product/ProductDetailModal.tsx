// components/product/ProductDetailModal.tsx
'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
// Import Supabase client ONLY if still needed for handleAddToCart
import { createClient } from '@/lib/supabase-client';

export default function ProductDetailModal({
    product,
    closeModal,
}: {
    product: Product;
    closeModal: () => void;
}) {
    const router = useRouter();
    const supabase = createClient(); // Keep if handleAddToCart is used
    const { session } = useAuthStore();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount =
        product.mrp && product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

    // --- handleAction for Add to Cart (Keep as is or simplify) ---
    const handleAddToCartAction = async () => {
        // This function adds the item to the persistent cart_items table
        if (!session) {
            closeModal(); // Close modal first
            router.push('/login');
            return { success: false };
        }

        const { data: existingItem, error: fetchError } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', product.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Cart check error:', fetchError);
            toast.error('Could not check cart. Please try again.');
            return { success: false };
        }

        let error = null;
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            ({ error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id));
        } else {
            ({ error } = await supabase.from('cart_items').insert({
                product_id: product.id,
                quantity,
                user_id: session.user.id,
            }));
        }

        if (error) {
            console.error('Cart update/insert error:', error);
            toast.error(`Error saving to cart: ${error.message}`);
            return { success: false };
        }

        router.refresh();
        return { success: true };
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const toastId = toast.loading('Adding to cart...');
        const { success } = await handleAddToCartAction();
        toast.dismiss(toastId);

        if (success) {
            toast.success(`${quantity} × ${product.name} added!`);
            setTimeout(() => {
                closeModal();
            }, 1000);
        } else {
            if (session) { // Only reset if redirect didn't happen
                setIsAdding(false);
            }
        }
        // Don't set isAdding false here if success, modal will close
    };
    // --- End Add to Cart Logic ---


    // --- UPDATED handleBuyNow ---
    const handleBuyNow = () => {
        if (!session) {
            closeModal(); // Close modal first
            router.push('/login');
            return;
        }

        setIsBuying(true);

        // 1. Prepare the item data
        const buyNowItem = {
            product_id: product.id,
            quantity: quantity,
            products: { // Embed necessary product details
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                mrp: product.mrp
            }
        };

        // 2. Store it temporarily
        try {
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            // 3. Close modal and redirect
            closeModal();
            // Use a small timeout to allow modal close animation to start
            setTimeout(() => {
                router.push('/checkout?buyNow=true');
            }, 150);
        } catch (error) {
            console.error("Error storing buy now item:", error);
            toast.error("Could not proceed to checkout. Please try again.");
            setIsBuying(false); // Reset loading state on error
        }
    };
    // ----------------------------

    // --- Component JSX (Keep structure, update button text) ---
    return (
        <div className="flex flex-col max-h-[85vh] overflow-hidden rounded-t-2xl md:rounded-xl bg-white">
            {/* Image */}
            <div className="relative w-full aspect-square md:aspect-video flex-shrink-0">
                <Image src={product.image_url} alt={product.name} fill className="object-cover rounded-t-2xl md:rounded-l-xl md:rounded-tr-none" priority />
            </div>
            {/* Details */}
            <div className="flex flex-col flex-grow p-4 md:p-6 overflow-y-auto">
                {/* Scrollable content */}
                <div className="flex-grow mb-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                    <h1 className="text-xl md:text-2xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                    <div className="flex items-baseline gap-2 md:gap-3 mt-3">
                        <p className="text-xl md:text-2xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-sm md:text-base text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <div className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-md">{discount}% OFF</div>}
                    </div>
                    <hr className="my-4 border-lighter-gray" />
                    <h3 className="font-semibold text-dark-gray mb-2 text-sm md:text-base">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{product.description || 'No description available.'}</p>
                </div>
                {/* Fixed Actions at bottom */}
                <div className="flex-shrink-0 pt-4 border-t border-lighter-gray bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm md:text-base font-semibold text-dark-gray">Quantity:</p>
                        <div className="flex items-center gap-1 md:gap-2 bg-gray-100 rounded-full">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 md:p-3 text-gray-600 hover:text-primary transition-colors rounded-full"><Minus size={14} /></button>
                            <p className="text-sm md:text-base font-bold w-6 md:w-8 text-center">{quantity}</p>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2 md:p-3 text-gray-600 hover:text-primary transition-colors rounded-full"><Plus size={14} /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={handleAddToCart}
                            disabled={isAdding || isBuying}
                            className="flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 text-sm py-2.5"
                        >
                            <ShoppingCart size={16} />
                            {isAdding ? 'Adding...' : 'Add to Cart'}
                        </Button>
                        <Button
                            onClick={handleBuyNow}
                            disabled={isAdding || isBuying} // Disable while adding too
                            className="flex items-center justify-center gap-2 text-sm py-2.5"
                        >
                            <Zap size={16} />
                            {isBuying ? 'Proceeding...' : 'Buy Now'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}