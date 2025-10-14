import { Order } from "@/lib/types";
import Link from "next/link";

const statusStyles: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
}

export default function OrderCard({ order }: { order: Order }) {
    return (
        <Link href={`/my-orders/${order.id}`} className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                </span>
            </div>
            <div className="mt-4 pt-4 border-t">
                <p className="font-semibold">{order.order_items.length} item(s)</p>
                <div className="flex justify-between items-baseline mt-2">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-xl text-primary">₹{order.total_price.toFixed(2)}</span>
                </div>
            </div>
        </Link>
    )
}