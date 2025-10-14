'use client'
import { Order } from "@/lib/types";
import Image from "next/image";

export default function OrderDetailView({ order }: { order: Order }) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Order Details</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-2">
                <p><strong>Order ID:</strong> #{order.id.slice(0, 8)}</p>
                <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="capitalize font-semibold">{order.status}</span></p>
                <p><strong>Total:</strong> <span className="font-bold text-primary">₹{order.total_price.toFixed(2)}</span></p>
                <p className="mt-4"><strong>Shipping Address:</strong><br />{order.shipping_address}</p>
            </div>

            <h2 className="text-2xl font-bold">Items</h2>
            <div className="space-y-4">
                {order.order_items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={item.products.image_url} alt={item.products.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="font-semibold">{item.products.name}</h3>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-500">Price: ₹{item.price_at_purchase.toFixed(2)}</p>
                        </div>
                        <p className="font-bold text-lg">₹{(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}