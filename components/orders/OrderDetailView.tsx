// components/orders/OrderDetailView.tsx
'use client'

import { Order } from "@/lib/types";
import Image from "next/image";
import BackButton from "../ui/BackButton";
import { MapPin, CreditCard, Package, CheckCircle, Truck, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to format the address object
const formatAddress = (addr: any) => {
    // Fallback for old data or if addr is just a string/UUID
    if (typeof addr === 'string') return addr;
    // Handle if the join returns null (e.g., address was deleted)
    if (!addr) return "No address provided.";

    const parts = [
        addr.house_no,
        addr.street_address,
        addr.landmark ? `(Near ${addr.landmark})` : null,
        `${addr.city}, ${addr.state} - ${addr.postal_code}`,
        addr.country
    ];

    return parts.filter(Boolean).join(', ');
};

const OrderStatusTracker = ({ status }: { status: Order['status'] }) => {
    const statuses: Order['status'][] = ['processing', 'shipped', 'delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    const StatusItem = ({ icon, label, isCompleted, isFirst, isLast }: { icon: React.ReactNode, label: string, isCompleted: boolean, isFirst?: boolean, isLast?: boolean }) => (
        <div className="relative flex flex-col items-center text-center w-1/3">
            {!isFirst && <div className={cn("absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 -translate-x-1/2", isCompleted ? 'bg-primary' : 'bg-gray-200')} />}
            <div className={cn("z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors", isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500')}>
                {icon}
            </div>
            <p className={cn("mt-2 text-xs md:text-sm font-semibold", isCompleted ? 'text-dark-gray' : 'text-gray-500')}>{label}</p>
        </div>
    );

    return (
        <div className="flex justify-between items-start pt-4">
            <StatusItem icon={<Package size={24} />} label="Processing" isCompleted={currentStatusIndex >= 0} isFirst />
            <StatusItem icon={<Truck size={24} />} label="Shipped" isCompleted={currentStatusIndex >= 1} />
            <StatusItem icon={<Home size={24} />} label="Delivered" isCompleted={currentStatusIndex >= 2} isLast />
        </div>
    );
};


export default function OrderDetailView({ order }: { order: Order }) {
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <BackButton />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
                    <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-full capitalize ${isCancelled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {order.status}
                </span>
            </div>

            {/* Order Status Tracker */}
            {!isCancelled && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <OrderStatusTracker status={order.status} />
                </div>
            )}


            {/* Main Order Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <MapPin size={20} className="text-primary" />
                        Shipping Address
                    </h2>
                    <div className="space-y-1 text-gray-600">
                        {/* This now safely accesses the joined address object */}
                        <p className="font-semibold text-dark-gray">{order.shipping_address?.full_name ?? 'No name provided'}</p>
                        <p>{formatAddress(order.shipping_address)}</p>
                        {order.shipping_address?.mobile_number && <p>Phone: {order.shipping_address.mobile_number}</p>}
                    </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                        <CreditCard size={20} className="text-primary" />
                        Payment Summary
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-semibold">{order.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-xl text-primary">₹{order.total_price.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items in this order */}
            <div>
                <h2 className="text-xl font-bold mb-4">Items in this Order</h2>
                <div className="space-y-4">
                    {order.order_items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
                            <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                    src={item.products.image_url}
                                    alt={item.products.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-semibold text-dark-gray">{item.products.name}</h3>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                <p className="text-sm text-gray-500">Price: ₹{item.price_at_purchase.toFixed(2)}</p>
                            </div>
                            <p className="font-bold text-lg text-dark-gray">₹{(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}