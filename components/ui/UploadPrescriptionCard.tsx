'use client';

import { Camera } from 'lucide-react';

export default function UploadPrescriptionCard() {
    const handlePress = () => {
        window.open('https://wa.me/919999050773', '_blank');
    };

    return (
        <button
            onClick={handlePress}
            className="group relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all duration-300 text-center aspect-square"
        >
            <div className="flex flex-col items-center justify-center">
                <Camera className="h-10 w-10 text-primary mb-3 transition-transform group-hover:scale-110" />
                <h3 className="text-md font-bold text-white leading-tight">Upload Prescription</h3>
                <p className="text-xs text-white/70 mt-1">
                    Send via WhatsApp
                </p>
            </div>
        </button>
    );
}