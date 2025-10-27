'use client';

import { Address } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../ui/Button";
import { createClient } from "@/lib/supabase-client";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface AddressFormProps {
    address?: Address;
    onSave?: () => void;
}

export default function AddressForm({ address, onSave }: AddressFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { session } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        street_address: address?.street_address || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || 'India',
        house_no: address?.house_no || '',
        mobile_number: address?.mobile_number || '',
        landmark: address?.landmark || '',
        is_default: address?.is_default || false,
    });

    const inputStyles =
        "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm mt-1";

    // ✅ Handle input changes
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    // ✅ Handle form submission
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!session?.user) {
            toast.error("Please login to save address");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from("addresses")
                .upsert({
                    id: address?.id, // if editing existing address
                    user_id: session.user.id,
                    ...formData,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success("Address saved successfully!");
            onSave?.();
            router.push("/my-addresses");
        } catch (error: any) {
            console.error(error);
            toast.error("Error saving address. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-subtle space-y-4">
            <div>
                <label className="block text-sm font-medium">Street Address</label>
                <input
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">House No / Flat No</label>
                    <input
                        name="house_no"
                        value={formData.house_no}
                        onChange={handleChange}
                        className={inputStyles}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Landmark</label>
                    <input
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        className={inputStyles}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">City</label>
                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">State</label>
                    <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Postal Code</label>
                    <input
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Country</label>
                    <input
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={inputStyles}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Mobile Number</label>
                <input
                    name="mobile_number"
                    type="tel"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                />
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_default" className="text-sm font-medium">
                    Set as default address
                </label>
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Address"}
                </Button>
            </div>
        </form>
    );
}
