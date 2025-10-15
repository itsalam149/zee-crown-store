"use client";

import { createClient } from '@/lib/supabase-client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Address, CartItem } from '@/lib/types';
import toast from 'react-hot-toast';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Loader2, PlusCircle, Pencil, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressForm from '@/components/profile/AddressForm';

// Define Razorpay at the window level for TypeScript
declare const window: any;

// --- MAIN CHECKOUT PAGE COMPONENT ---
export default function CheckoutPage() {
    const router = useRouter();
    const { session } = useAuthStore();
    const supabase = createClient();

    // State Management
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);

    // Fetch initial cart and address data
    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoading(true);

        const [cartResult, addressResult] = await Promise.all([
            supabase.from('cart_items').select('*, products(*)').eq('user_id', session.user.id),
            supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false })
        ]);

        const { data: cartData, error: cartError } = cartResult;
        const { data: addressData, error: addressError } = addressResult;

        if (cartError || addressError) {
            toast.error("Failed to load checkout data.");
            router.push('/cart');
            return;
        }

        if (!cartData || cartData.length === 0) {
            toast.error("Your cart is empty.");
            router.push('/');
            return;
        }

        setCartItems(cartData as CartItem[]);
        setAddresses(addressData);

        if (addressData && addressData.length > 0) {
            setSelectedAddressId(addressData[0].id);
            setShowAddAddress(false);
        } else {
            setShowAddAddress(true);
        }

        setLoading(false);
    }, [session, supabase, router]);

    useEffect(() => {
        if (session) {
            fetchData();
        } else if (useAuthStore.getState().isRestored) {
            router.push('/login');
        }
    }, [session, router, fetchData]);

    // Calculate totals
    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0), [cartItems]);

    useEffect(() => {
        const fetchShippingFee = async () => {
            if (subtotal === 0) {
                setShippingFee(0);
                return;
            }
            const { data } = await supabase
                .from('shipping_rules')
                .select('charge, min_order_value')
                .eq('is_active', true)
                .order('min_order_value', { ascending: false });

            const applicableRule = data?.find(rule => subtotal >= rule.min_order_value);
            setShippingFee(applicableRule ? applicableRule.charge : 40); // Default to 40 if no rule matches
        };
        fetchShippingFee();
    }, [subtotal, supabase]);

    const total = subtotal + shippingFee;

    // --- ORDER PLACEMENT ---
    const handleConfirmOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select or add a shipping address.");
            return;
        }
        setIsProcessing(true);

        try {
            if (selectedPaymentMethod === 'ONLINE') {
                // 1. Invoke "create-razorpay-order" Edge Function
                const { data: orderData, error: orderError } = await supabase.functions.invoke(
                    'create-razorpay-order', { body: { amount: total, currency: 'INR', receipt: `receipt_${Date.now()}` } }
                );

                if (orderError) throw new Error(orderError.message);

                // 2. Open Razorpay Checkout
                const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: 'INR',
                    name: 'Zee Crown',
                    description: 'Order Payment',
                    order_id: orderData.id,
                    handler: async () => {
                        // 3. On success, invoke "create-order" Edge Function
                        const { data: finalOrder, error: finalOrderError } = await supabase.functions.invoke('create-order', {
                            body: { address_id: selectedAddressId, payment_method: 'Paid' }
                        });
                        if (finalOrderError) throw new Error(finalOrderError.message);
                        toast.success('Order placed successfully!');
                        router.replace(`/my-orders/${finalOrder.order_id}`);
                    },
                    prefill: {
                        name: session?.user.user_metadata.full_name || 'Customer',
                        email: session?.user.email,
                        contact: selectedAddress?.mobile_number || '',
                    },
                    theme: { color: '#FF7C30' }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                rzp.on('payment.failed', (response: any) => {
                    toast.error(`Payment Failed: ${response.error.description}`);
                    setIsProcessing(false);
                });

            } else { // COD
                const { data: finalOrder, error: finalOrderError } = await supabase.functions.invoke('create-order', {
                    body: { address_id: selectedAddressId, payment_method: 'COD' }
                });
                if (finalOrderError) throw new Error(finalOrderError.message);
                toast.success('Order placed successfully!');
                router.replace(`/my-orders/${finalOrder.order_id}`);
            }
        } catch (error: any) {
            toast.error(error.message);
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-grayBG min-h-screen">
            <div className="container mx-auto max-w-4xl p-4">
                <BackButton />
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Main Content */}
                    <div className="flex-grow space-y-6">
                        {/* Shipping Address Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                            {addresses.length > 0 && !showAddAddress ? (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <AddressCard key={addr.id} address={addr} isSelected={selectedAddressId === addr.id} onSelect={() => setSelectedAddressId(addr.id)} />
                                    ))}
                                    <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-2 text-primary font-semibold mt-4 hover:opacity-80">
                                        <PlusCircle size={20} /> Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <AddressForm onSave={() => fetchData()} />
                                    {addresses.length > 0 && <Button onClick={() => setShowAddAddress(false)} className="mt-4 bg-gray hover:bg-dark-gray">Cancel</Button>}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <PaymentOption label="Cash on Delivery (COD)" value="COD" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                                <PaymentOption label="Pay Online (UPI, Cards, etc.)" value="ONLINE" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-96 lg:sticky top-24">
                        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                            <h2 className="text-xl font-bold">Order Summary</h2>
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="flex-1 truncate pr-2">{item.products.name} (x{item.quantity})</span>
                                    <span className="font-medium">₹{(item.products.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                            <SummaryRow label="Shipping Fee" value={`₹${shippingFee.toFixed(2)}`} />
                            <hr />
                            <SummaryRow label="Total" value={`₹${total.toFixed(2)}`} isTotal />

                            <Button onClick={handleConfirmOrder} disabled={isProcessing || loading}>
                                {isProcessing ? 'Placing Order...' : `Confirm Order (${selectedPaymentMethod})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Sub-components for Checkout Page ---

const AddressCard = ({ address, isSelected, onSelect }: { address: Address; isSelected: boolean; onSelect: () => void; }) => (
    <div onClick={onSelect} className={cn("p-4 border rounded-lg cursor-pointer transition-all", isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-400')}>
        <div className="flex items-start gap-3">
            <MapPin className={cn("h-5 w-5 mt-1", isSelected ? 'text-primary' : 'text-gray-400')} />
            <div className="flex-1">
                <p className="font-bold text-dark-gray">{address.street_address}</p>
                <p className="text-sm text-gray-600">{address.house_no && `${address.house_no}, `}{address.city}, {address.state} - {address.postal_code}</p>
                <p className="text-sm text-gray-600">Mobile: {address.mobile_number}</p>
            </div>
            <Link href={`/addresses/edit/${address.id}`} className="p-1 text-gray-500 hover:text-primary"><Pencil size={16} /></Link>
        </div>
    </div>
);

const PaymentOption = ({ label, value, selected, onSelect }: { label: string; value: string; selected: string; onSelect: (val: string) => void }) => (
    <div onClick={() => onSelect(value)} className={cn("flex items-center p-4 border rounded-lg cursor-pointer", selected === value ? 'border-primary ring-2 ring-primary' : 'border-gray-200 hover:border-gray-400')}>
        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mr-3">
            {selected === value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
        <span className="font-semibold">{label}</span>
    </div>
);

const SummaryRow = ({ label, value, isTotal = false }: { label: string; value: string; isTotal?: boolean; }) => (
    <div className="flex justify-between items-center">
        <p className={cn(isTotal ? 'font-bold' : 'text-gray-600')}>{label}</p>
        <p className={cn('font-semibold', isTotal && 'text-xl text-primary')}>{value}</p>
    </div>
);