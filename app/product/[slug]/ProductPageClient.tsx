// app/product/[slug]/ProductPageClient.tsx
'use client';

import { Product } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
// No Supabase client needed here anymore for handleBuyNow's core logic
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Zap, CheckCircle } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
// Import Supabase client ONLY if still needed for handleAddToCart
import { createClient } from '@/lib/supabase-client';

export default function ProductPageClient({ product }: { product: Product }) {
    const router = useRouter();
    const supabase = createClient(); // Keep if handleAddToCart is used
    const { session } = useAuthStore();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false); // For Add to Cart button
    const [isBuying, setIsBuying] = useState(false); // For Buy Now button
    const [addedToCart, setAddedToCart] = useState(false);

    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    // --- handleAction for Add to Cart (Keep as is or simplify if only Buy Now exists) ---
    const handleAddToCartAction = async () => {
        // This function adds the item to the persistent cart_items table
        if (!session) {
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

        router.refresh();
        return { success: true };
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const { success } = await handleAddToCartAction();
        if (success) {
            toast.success(`${quantity} × ${product.name} added to cart!`);
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        }
        if (session) {
            setIsAdding(false);
        }
    };
    // --- End Add to Cart Logic ---

    // --- UPDATED handleBuyNow ---
    const handleBuyNow = () => {
        if (!session) {
            // Redirect to login, potentially passing the intended action
            // You could add query params like ?redirect=/product/slug&action=buyNow
            router.push('/login');
            return;
        }

        setIsBuying(true); // Show loading state on button

        // 1. Prepare the item data
        const buyNowItem = {
            product_id: product.id,
            quantity: quantity,
            // Include necessary product details directly
            products: {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                // Add any other fields needed by checkout/order creation
                mrp: product.mrp
            }
        };

        // 2. Store it temporarily (SessionStorage is cleared when browser tab closes)
        try {
            sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
            // 3. Redirect to checkout with a flag
            router.push('/checkout?buyNow=true');
        } catch (error) {
            console.error("Error storing buy now item:", error);
            toast.error("Could not proceed to checkout. Please try again.");
            setIsBuying(false); // Reset loading state on error
        }
        // No need to set isBuying false on success, navigation handles it
    };
    // ----------------------------

    // --- Component JSX (Keep the structure, update button text/state) ---
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Section */}
                <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                    />
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    {/* Category and Title */}
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold text-dark-gray mt-1">{product.name}</h1>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-3 my-4">
                        <p className="text-4xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-xl text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <p className="text-lg font-bold text-green-600">{discount}% OFF</p>}
                    </div>

                    {/* Description */}
                    <div className="mt-4 flex-grow">
                        <h2 className="font-bold text-lg mb-2 text-dark-gray">Description</h2>
                        <p className="text-gray-600 leading-relaxed">{product.description || 'No description available for this product.'}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-lg font-semibold text-dark-gray">Quantity:</p>
                            <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Decrease quantity"><Minus size={18} /></button>
                                <p className="text-lg font-bold w-10 text-center">{quantity}</p>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-600 hover:text-primary transition-colors rounded-full" aria-label="Increase quantity"><Plus size={18} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isAdding || isBuying || addedToCart}
                                className="flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 disabled:bg-green-100 disabled:text-green-700"
                            >
                                {addedToCart ? (
                                    <>
                                        <CheckCircle size={20} /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} />
                                        {isAdding ? 'Adding...' : 'Add to Cart'}
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                disabled={isAdding || isBuying} // Disable while adding to cart too
                                className="flex items-center justify-center gap-2"
                            >
                                <Zap size={20} />
                                {/* Update button text based on isBuying state */}
                                {isBuying ? 'Proceeding...' : 'Buy Now'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}