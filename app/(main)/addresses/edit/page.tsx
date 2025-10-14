'use client';

import AddressForm from "@/components/profile/AddressForm";
import BackButton from "@/components/ui/BackButton";
import { createClient } from "@/lib/supabase-client";
import { Address } from "@/lib/types";
import { useEffect, useState } from "react";

export default function EditAddressPage({ params }: { params: { addressId: string } }) {
    const supabase = createClient();
    const [address, setAddress] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddress = async () => {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('id', params.addressId)
                .single();

            if (data) {
                setAddress(data);
            }
            setLoading(false);
        };
        fetchAddress();
    }, [params.addressId, supabase]);

    return (
        <div className="max-w-2xl mx-auto">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">Edit Address</h1>
            {loading ? (
                <p>Loading address...</p>
            ) : address ? (
                <AddressForm address={address} />
            ) : (
                <p>Address not found.</p>
            )}
        </div>
    );
}