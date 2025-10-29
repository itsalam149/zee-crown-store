// app/(main)/checkout/page.tsx
"use client";

import { createClient } from '@/lib/supabase-client';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'; // Import Suspense
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Address, CartItem, Product } from '@/lib/types'; // Import Product type
import toast from 'react-hot-toast';

import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { Loader2, PlusCircle, Pencil, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddressForm from '@/components/profile/AddressForm';

// Define Razorpay at the window level for TypeScript
declare const window: any;

// Define a type for the Buy Now item stored in sessionStorage
// It includes the essential product details needed for display and order creation
interface BuyNowItem {
    product_id: string;
    quantity: number;
    products: Pick<Product, 'id' | 'name' | 'price' | 'image_url' | 'mrp'>; // Use Pick for relevant fields
}

// --- Main Checkout Page Component Logic ---
function CheckoutPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { session } = useAuthStore();
    const supabase = createClient();

    // State Management
    const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]); // Use generic name
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [shippingFee, setShippingFee] = useState(0);

    // Check if this is a "Buy Now" flow
    const isBuyNowFlow = useMemo(() => searchParams.get('buyNow') === 'true', [searchParams]);

    // Fetch initial data (either single Buy Now item or full cart)
    const fetchData = useCallback(async () => {
        // Ensure fresh session before deciding redirects (avoids false logouts on navigation)
        let effectiveSession = session;
        if (!effectiveSession) {
            const { data: { session: liveSession } } = await supabase.auth.getSession();
            effectiveSession = liveSession || null;
        }
        if (!effectiveSession) {
            const redirectUrl = isBuyNowFlow ? '/checkout?buyNow=true' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
            return;
        }
        setLoading(true);
        setShowAddAddress(false); // Reset address form state

        let itemsToCheckout: CartItem[] = [];
        let dataError = false;

        // --- Determine items to checkout ---
        if (isBuyNowFlow) {
            try {
                const itemString = sessionStorage.getItem('buyNowItem') || localStorage.getItem('buyNowItem');
                if (itemString) {
                    const buyNowItem: BuyNowItem = JSON.parse(itemString);
                    // Convert BuyNowItem structure slightly to match CartItem for consistency
                    // Generate a temporary ID or use product_id if uniqueness isn't critical for display key
                    itemsToCheckout = [{
                        id: `buyNow-${buyNowItem.product_id}`, // Temporary ID for React key
                        user_id: effectiveSession.user.id, // Assign current user
                        product_id: buyNowItem.product_id,
                        quantity: buyNowItem.quantity,
                        created_at: new Date().toISOString(), // Add a created_at timestamp
                        products: { // Ensure all required fields from Product are present or defaulted
                            ...buyNowItem.products,
                            description: '', // Add defaults for missing fields if CartItem expects them
                            category: '',
                            created_at: new Date().toISOString(),
                        }
                    }];
                } else {
                    // Fallback: build from URL params
                    const pid = searchParams.get('pid');
                    const qty = parseInt(searchParams.get('qty') || '1', 10) || 1;
                    if (!pid) {
                        toast.error("Buy Now item not found. Please try again.");
                        router.push('/');
                        return;
                    }
                    const { data: product, error: pErr } = await supabase
                        .from('products')
                        .select('*')
                        .eq('id', pid)
                        .single();
                    if (pErr || !product) {
                        toast.error("Could not load the product.");
                        router.push('/');
                        return;
                    }
                    itemsToCheckout = [{
                        id: `buyNow-${pid}`,
                        user_id: effectiveSession.user.id,
                        product_id: pid,
                        quantity: qty,
                        created_at: new Date().toISOString(),
                        products: {
                            ...product,
                        }
                    }];
                }
            } catch (error) {
                console.error("Error parsing Buy Now item:", error);
                toast.error("Error loading item for Buy Now.");
                router.push('/');
                return;
            }
        } else {
            // Fetch full cart
            const { data: cartData, error: cartError } = await supabase
                .from('cart_items')
                .select('*, products(*)')
                .eq('user_id', effectiveSession.user.id);

            if (cartError) {
                toast.error("Failed to load cart items.");
                dataError = true;
            } else if (!cartData || cartData.length === 0) {
                toast.error("Your cart is empty.");
                router.push('/'); // Go home if cart is empty for normal checkout
                return;
            } else {
                itemsToCheckout = cartData as CartItem[];
            }
        }

        // --- Fetch Addresses (common logic) ---
        const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', effectiveSession.user.id)
            .order('is_default', { ascending: false });

        if (addressError) {
            toast.error("Failed to load addresses.");
            dataError = true;
        }

        if (dataError) {
            setLoading(false);
            // Decide where to redirect on general data error, maybe home or cart
            router.push(isBuyNowFlow ? '/' : '/cart');
            return;
        }

        // --- Set State ---
        setCheckoutItems(itemsToCheckout);
        setAddresses(addressData || []);

        // Select default address or show form
        if (addressData && addressData.length > 0) {
            const defaultAddress = addressData.find(addr => addr.is_default) || addressData[0];
            setSelectedAddressId(defaultAddress.id);
            setShowAddAddress(false);
        } else {
            setShowAddAddress(true); // Show form if no addresses exist
        }

        setLoading(false);
    }, [session, supabase, router, isBuyNowFlow]);

    useEffect(() => {
        fetchData(); // Fetch data on component mount or when dependencies change
        // Cleanup sessionStorage if the user navigates away from checkout during buy now
        return () => {
            if (isBuyNowFlow) {
                // Consider if you want to clear this always on unmount,
                // or only after successful order placement.
                // For now, let's clear it on unmount to prevent stale data
                // if the user navigates back and forth.
                // sessionStorage.removeItem('buyNowItem'); // Moved cleanup to handleConfirmOrder success
            }
        }
    }, [fetchData, isBuyNowFlow]); // Rerun fetchData if isBuyNowFlow changes (though unlikely)


    // Calculate totals based on checkoutItems
    const subtotal = useMemo(() => checkoutItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0), [checkoutItems]);

    // Fetch Shipping Fee (no changes needed here, depends on subtotal)
    useEffect(() => {
        const fetchShippingFee = async () => {
            if (subtotal === 0) {
                setShippingFee(0);
                return;
            }
            // Use default if Supabase call fails or returns no rules
            let fee = 40;
            let threshold = 500; // A default threshold for free shipping

            try {
                const { data } = await supabase
                    .from('shipping_rules')
                    .select('charge, min_order_value')
                    .eq('is_active', true)
                    .order('min_order_value', { ascending: false });

                if (data && data.length > 0) {
                    const freeRule = data.find(rule => rule.charge === 0);
                    if (freeRule) threshold = freeRule.min_order_value;

                    const applicableRule = data.find(rule => subtotal >= rule.min_order_value);
                    fee = applicableRule ? applicableRule.charge : (data[data.length - 1]?.charge ?? 40); // Use lowest defined fee or default
                }
            } catch (error) {
                console.error("Error fetching shipping rules:", error);
                // Keep default fee/threshold on error
            }

            setShippingFee(subtotal >= threshold ? 0 : fee);
        };
        fetchShippingFee();
    }, [subtotal, supabase]);


    const total = subtotal + shippingFee;

    // --- UPDATED ORDER PLACEMENT ---
    const handleConfirmOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select or add a shipping address.");
            return;
        }
        setIsProcessing(true);

        try {
            // Prepare the body for the Edge Function
            const functionBody: { address_id: string; payment_method: string; buy_now_item?: BuyNowItem } = {
                address_id: selectedAddressId,
                payment_method: selectedPaymentMethod === 'ONLINE' ? 'Paid' : 'COD', // Send 'Paid' or 'COD'
            };

            // If it's a Buy Now flow, add the item details to the body
            if (isBuyNowFlow) {
                const itemString = sessionStorage.getItem('buyNowItem');
                if (itemString) {
                    functionBody.buy_now_item = JSON.parse(itemString);
                } else {
                    throw new Error("Buy Now item data is missing.");
                }
            }

            if (selectedPaymentMethod === 'ONLINE') {
                // 1. Invoke "create-razorpay-order" Edge Function (no change needed here)
                const { data: orderData, error: orderError } = await supabase.functions.invoke(
                    'create-razorpay-order', { body: { amount: total, currency: 'INR', receipt: `receipt_${Date.now()}` } }
                );
                if (orderError) throw new Error(`Razorpay Order Error: ${orderError.message}`);
                if (!orderData?.id) throw new Error("Failed to create Razorpay order ID.");


                // 2. Open Razorpay Checkout
                const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this is set in your .env.local
                    amount: orderData.amount, // Amount in paise
                    currency: 'INR',
                    name: 'Zee Crown',
                    description: 'Order Payment',
                    order_id: orderData.id, // Razorpay Order ID
                    handler: async (response: any) => {
                        // 3. On successful payment, invoke "create-order" Edge Function with payment details
                        try {
                            const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                            const responseApi = await fetch('/api/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    address: selectedAddress,
                                    cartItems: checkoutItems,
                                    total,
                                    payment: {
                                        method: 'ONLINE',
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature
                                    }
                                })
                            });
                            const finalOrder = await responseApi.json();
                            if (!responseApi.ok) throw new Error(finalOrder?.error || 'Order creation failed');
                            if (!finalOrder?.orderId) throw new Error('Order ID not received after creation.');

                            // Cleanup sessionStorage ONLY on successful order for Buy Now
                            if (isBuyNowFlow) {
                                sessionStorage.removeItem('buyNowItem');
                            }

                            toast.success('Order placed successfully!');
                            router.replace(`/my-orders/${finalOrder.orderId}`);

                        } catch (finalOrderError: any) {
                            console.error("Error in handler after payment:", finalOrderError);
                            toast.error(finalOrderError.message || 'Failed to finalize order after payment.');
                            setIsProcessing(false); // Re-enable button on handler failure
                        }
                    },
                    prefill: {
                        name: session?.user.user_metadata.full_name || 'Customer',
                        email: session?.user.email,
                        contact: selectedAddress?.mobile_number || '',
                    },
                    theme: { color: '#FF7C30' } // Example primary color
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                rzp.on('payment.failed', (response: any) => {
                    console.error('Razorpay Payment Failed:', response.error);
                    toast.error(`Payment Failed: ${response.error.description || 'Unknown error'}`);
                    setIsProcessing(false);
                });
                // Note: Don't set isProcessing false here immediately after rzp.open()
                // It should only be reset on success (handled by handler) or failure (rzp.on)

            } else { // COD
                const selectedAddress = addresses.find(a => a.id === selectedAddressId);
                const responseApi = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: selectedAddress,
                        cartItems: checkoutItems,
                        total,
                        payment: { method: 'COD' }
                    })
                });
                const finalOrder = await responseApi.json();
                if (!responseApi.ok) throw new Error(finalOrder?.error || 'Order creation failed');
                if (!finalOrder?.orderId) throw new Error('Order ID not received after creation.');

                // Cleanup sessionStorage ONLY on successful order for Buy Now
                if (isBuyNowFlow) {
                    sessionStorage.removeItem('buyNowItem');
                }

                toast.success('Order placed successfully!');
                router.replace(`/my-orders/${finalOrder.orderId}`);
            }
        } catch (error: any) {
            console.error("Order confirmation error:", error);
            toast.error(error.message || 'An unexpected error occurred.');
            setIsProcessing(false); // Reset processing state on error
        }
        // Don't reset isProcessing on success here, navigation handles it.
    };
    // ----------------------------


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // --- Component JSX ---
    return (
        <div className="bg-grayBG min-h-screen pb-24 md:pb-0"> {/* Add padding bottom for mobile fixed summary */}
            <div className="container mx-auto max-w-4xl p-4">
                <BackButton />
                <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout {isBuyNowFlow ? '(Buy Now)' : ''}</h1>

                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Main Content */}
                    <div className="flex-grow space-y-6">
                        {/* Shipping Address Section */}
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                            {addresses.length > 0 && !showAddAddress ? (
                                <div className="space-y-3">
                                    {addresses.map(addr => (
                                        <AddressCard
                                            key={addr.id}
                                            address={addr}
                                            isSelected={selectedAddressId === addr.id}
                                            onSelect={() => setSelectedAddressId(addr.id)}
                                        />
                                    ))}
                                    <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-2 text-primary font-semibold mt-4 hover:opacity-80 transition-opacity">
                                        <PlusCircle size={20} /> Add New Address
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {/* Pass onSave to refresh data after adding, onCancel to hide form */}
                                    <AddressForm
                                        onSave={() => fetchData()}
                                        onCancel={addresses.length > 0 ? () => setShowAddAddress(false) : undefined} // Only show cancel if other addresses exist
                                    />
                                    {/* Removed redundant cancel button */}
                                </div>
                            )}
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <PaymentOption label="Cash on Delivery (COD)" value="COD" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                                <PaymentOption label="Pay Online (UPI, Cards, etc.)" value="ONLINE" selected={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar/Fixed Footer */}
                    {/* Use checkoutItems instead of cartItems */}
                    <div className="w-full lg:w-96 lg:sticky lg:top-24">
                        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 pt-5 border-t border-gray-200
                                        lg:border lg:relative lg:rounded-lg lg:shadow-md lg:p-6 z-20"> {/* Ensure z-index is high for fixed */}
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-2 max-h-24 overflow-y-auto mb-3 lg:max-h-none lg:mb-4"> {/* Scrollable items on mobile */}
                                {checkoutItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm items-center">
                                        <span className="flex-1 truncate pr-2">{item.products.name} (x{item.quantity})</span>
                                        <span className="font-medium whitespace-nowrap">₹{(item.products.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <hr className="mb-3 lg:mb-4" />
                            <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                            <SummaryRow label="Shipping Fee" value={shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : (subtotal > 0 ? 'FREE' : '₹0.00')} />
                            <hr className="my-3" />
                            <SummaryRow label="Total" value={`₹${total.toFixed(2)}`} isTotal />

                            <Button
                                onClick={handleConfirmOrder}
                                disabled={isProcessing || loading || checkoutItems.length === 0 || !selectedAddressId}
                                className="w-full mt-6"
                            >
                                {isProcessing ? 'Placing Order...' : `Confirm Order (${selectedPaymentMethod})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Sub-components for Checkout Page (No changes needed) ---

const AddressCard = ({ address, isSelected, onSelect }: { address: Address; isSelected: boolean; onSelect: () => void; }) => (
    <div
        onClick={onSelect}
        className={cn(
            "p-4 border rounded-lg cursor-pointer transition-all duration-150",
            isSelected
                ? 'border-primary ring-2 ring-primary ring-offset-1 bg-primary/5' // Added subtle bg and offset
                : 'border-gray-200 hover:border-gray-400 bg-white'
        )}
    >
        <div className="flex items-start gap-3">
            <MapPin className={cn("h-5 w-5 mt-1 flex-shrink-0", isSelected ? 'text-primary' : 'text-gray-400')} />
            <div className="flex-1 min-w-0"> {/* Added min-w-0 for truncation */}
                {/* Use address.full_name here if it existed, otherwise fetch from profile if needed */}
                {/* <p className="font-semibold text-dark-gray truncate">{address.full_name || 'No Name'}</p> */}
                <p className="font-semibold text-dark-gray truncate">{address.street_address}</p>
                <p className="text-sm text-gray-600 truncate">{address.house_no && `${address.house_no}, `}{address.city}, {address.state} - {address.postal_code}</p>
                <p className="text-sm text-gray-600">Mobile: {address.mobile_number}</p>
            </div>
            {/* Link to edit page - assumes edit page exists */}
            {/* Ensure '/addresses/edit/${address.id}' is a valid route */}
            <Link href={`/addresses/edit/${address.id}`} className="p-1 text-gray-500 hover:text-primary flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Pencil size={16} />
            </Link>
        </div>
    </div>
);


const PaymentOption = ({ label, value, selected, onSelect }: { label: string; value: string; selected: string; onSelect: (val: string) => void }) => (
    <div
        onClick={() => onSelect(value)}
        className={cn(
            "flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-150",
            selected === value
                ? 'border-primary ring-2 ring-primary ring-offset-1 bg-primary/5' // Added subtle bg and offset
                : 'border-gray-200 hover:border-gray-400 bg-white'
        )}
    >
        <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0",
            selected === value ? "border-primary bg-primary" : "border-gray-400"
        )}>
            {selected === value && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
        <span className="font-medium text-sm md:text-base">{label}</span> {/* Adjusted font size */}
    </div>
);


const SummaryRow = ({ label, value, isTotal = false }: { label: string; value: string; isTotal?: boolean; }) => (
    <div className="flex justify-between items-center">
        <p className={cn("text-sm md:text-base", isTotal ? 'font-semibold' : 'text-gray-600')}>{label}</p> {/* Adjusted font size */}
        <p className={cn('font-semibold', isTotal ? 'text-lg md:text-xl text-primary' : 'text-base md:text-lg text-dark-gray')}>{value}</p> {/* Adjusted font size */}
    </div>
);

// Wrap default export in Suspense
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <CheckoutPageContent />
        </Suspense>
    );
}