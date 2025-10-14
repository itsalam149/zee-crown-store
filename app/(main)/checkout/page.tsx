'use client'
import { createClient } from '@/lib/supabase-client';
import { useState } from 'react';

export default function CheckoutPage() {
    const supabase = createClient();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // This is a placeholder for your order creation logic
        // You would call your `api/create-order` endpoint here
        alert('Order placed (simulation)!');
        // In a real app, you would redirect to an order confirmation page
        setIsProcessing(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <form onSubmit={handlePlaceOrder} className="bg-white p-6 rounded-lg shadow-md">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
                        <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2" />
                    </div>
                </div>
                <div className="mt-6">
                    <button type="submit" disabled={isProcessing} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
                        {isProcessing ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}