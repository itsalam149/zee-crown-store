'use client';

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase-client";
import { Address } from "@/lib/types";
import AddressCard from "@/components/profile/AddressCard";
import { PackageOpen } from "lucide-react";

export default function AddressesPage() {
    const { session } = useAuthStore();
    const router = useRouter();
    const supabase = createClient();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }

        const fetchAddresses = async () => {
            const { data } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id)
                .order('is_default', { ascending: false });

            if (data) setAddresses(data);
            setLoading(false);
        };

        fetchAddresses();
    }, [session, router, supabase]);

    if (!session) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <BackButton />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Addresses</h1>
                <Link href="/addresses/new" className="bg-primary text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity">
                    Add New Address
                </Link>
            </div>

            {loading ? (
                <p>Loading addresses...</p>
            ) : addresses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <PackageOpen size={64} className="mx-auto text-gray-300" />
                    <h1 className="text-2xl font-bold mt-4">No Saved Addresses</h1>
                    <p className="text-gray-500 mt-2">Addresses you add will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map(address => (
                        <AddressCard key={address.id} address={address} />
                    ))}
                </div>
            )}
        </div>
    );
}
