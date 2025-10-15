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

export default function ProductDetailModal({
    product,
    closeModal,
}: {
    product: Product;
    closeModal: () => void;
}) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();

    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    const discount =
        product.mrp && product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

    const handleAction = async () => {
        if (!session) {
            toast.error('Please login to continue.');
            closeModal();
            router.push('/login');
            return { success: false };
        }

        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', product.id)
            .single();

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);
            if (error) { toast.error(error.message); return { success: false }; }
        } else {
            const { error } = await supabase.from('cart_items').insert({
                product_id: product.id,
                quantity,
                user_id: session.user.id,
            });
            if (error) { toast.error(error.message); return { success: false }; }
        }

        router.refresh(); // This tells Next.js to refetch the data on the underlying page.
        return { success: true };
    };

    const handleAddToCart = async () => {
        setIsAdding(true);
        const toastId = toast.loading('Adding to cart...');
        const { success } = await handleAction();
        toast.dismiss(toastId);

        if (success) {
            toast.success(`${quantity} × ${product.name} added!`);

            // THE FIX: Call the closeModal prop after 1 second.
            setTimeout(() => {
                closeModal();
            }, 1000); // 1000 milliseconds = 1 second

        } else {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        setIsBuying(true);
        const { success } = await handleAction();
        if (success) {
            router.push('/checkout');
        } else {
            setIsBuying(false);
        }
    };

    return (
        <div className="flex flex-col max-h-[85vh] overflow-hidden rounded-t-2xl bg-white">
            <div className="relative w-full aspect-square md:aspect-video">
                <Image src={product.image_url} alt={product.name} fill className="object-cover rounded-t-2xl" priority />
            </div>
            <div className="flex flex-col flex-grow p-6 overflow-y-auto">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{product.category}</p>
                    <h1 className="text-2xl font-bold text-dark-gray tracking-tight mt-1">{product.name}</h1>
                    <div className="flex items-baseline gap-3 mt-3">
                        <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                        {product.mrp && product.mrp > product.price && <p className="text-gray-400 line-through">₹{product.mrp}</p>}
                        {discount > 0 && <div className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">{discount}% OFF</div>}
                    </div>
                </div>
                <hr className="my-4 border-lighter-gray" />
                <div className="text-gray-600 leading-relaxed text-sm">
                    <h3 className="font-bold text-dark-gray mb-2 text-base">Description</h3>
                    <p>{product.description || 'No description available.'}</p>
                </div>
            </div>
            <div className="flex-shrink-0 p-6 border-t border-lighter-gray bg-white">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-base font-semibold text-dark-gray">Quantity:</p>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full"><Minus size={16} /></button>
                        <p className="text-base font-bold w-8 text-center">{quantity}</p>
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-600 hover:text-primary transition-colors rounded-full"><Plus size={16} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleAddToCart} disabled={isAdding || isBuying} className="flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20">
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