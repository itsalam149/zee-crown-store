'use client';

import AddressForm from "@/components/profile/AddressForm";
import BackButton from "@/components/ui/BackButton";

export default function NewAddressPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <BackButton />
            <h1 className="text-3xl font-bold mb-6">Add a New Address</h1>
            <AddressForm />
        </div>
    );
}
