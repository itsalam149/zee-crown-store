'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductDetailModal from './ProductDetailModal';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            // Prevent background scrolling when modal is open
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === modalRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{
                backgroundColor: 'transparent',
            }}
        >
            <div
                ref={contentRef}
                className="relative bg-white w-full rounded-t-2xl md:rounded-xl md:max-w-4xl md:mb-8 shadow-lifted mt-auto"
                style={{
                    animation: 'slideUp 0.3s ease-out',
                    maxHeight: '90vh',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 p-2 md:hidden">
                    <div className="w-12 h-1.5 bg-white/70 rounded-full" />
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-30 bg-gray-100 rounded-full p-1 text-gray-700 hover:bg-red hover:text-white transition-colors hidden md:block"
                >
                    <X size={20} />
                </button>

                <ProductDetailModal product={product} closeModal={onClose} />
            </div>
        </div>
    );
}

