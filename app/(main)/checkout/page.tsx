"use client"; // Must be at the very top

import { createClient } from '@/lib/supabase-client';
import { useState } from 'react';
import BackButton from '@/components/ui/BackButton';

export default function CheckoutPage() {
    const supabase = createClient(); // Supabase client
    const [name, setName] = useState<string>(''); // Name state
    const [address, setAddress] = useState<string>(''); // Address state
    const [isProcessing, setIsProcessing] = useState<boolean>(false); // Button loading state

    // Handle order placement
    const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // Simulate placing order (replace this with real API/Supabase call)
            // Example: await supabase.from('orders').insert({ name, address });

            alert('Order placed successfully (simulation)!');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
            <form
                onSubmit={handlePlaceOrder}
                className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Shipping Address
                        </label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isProcessing ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}
