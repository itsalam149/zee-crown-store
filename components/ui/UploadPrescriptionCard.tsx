import { Camera } from 'lucide-react';

export default function UploadPrescriptionCard() {
    const handlePress = () => {
        // Opens WhatsApp in a new tab
        window.open('https://wa.me/919999050773', '_blank');
    };

    return (
        <button
            onClick={handlePress}
            className="group flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-lightPrimary hover:bg-light transition-colors text-center aspect-square"
        >
            <Camera className="h-12 w-12 text-primary mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-sm font-bold text-primary">Upload Prescription</h3>
            <p className="text-xs text-dark-gray mt-1">
                Send it via WhatsApp
            </p>
        </button>
    );
}