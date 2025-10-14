import { CartItem } from "@/lib/types";
import Image from "next/image";
import { X } from "lucide-react";

export default function CartCard({ item }: { item: CartItem }) {
    // In a real app, you would add functions to update/remove items
    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-white">
            <div className="relative w-24 h-24 rounded-md overflow-hidden">
                <Image src={item.products.image_url} alt={item.products.name} layout="fill" objectFit="cover" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold">{item.products.name}</h3>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                <p className="text-lg font-bold text-primary mt-1">₹{item.products.price * item.quantity}</p>
            </div>
            <button className="text-gray-400 hover:text-red">
                <X size={20} />
            </button>
        </div>
    )
}