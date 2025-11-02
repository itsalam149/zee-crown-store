'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItemProps {
    name: string;
    Icon: LucideIcon;
    isSelected: boolean;
}

// Map category names to their gradient colors for the "pressed" state
const categoryGradients: { [key: string]: string } = {
    medicine: 'bg-gradient-to-br from-theme-green-fg to-green-500',
    cosmetics: 'bg-gradient-to-br from-theme-blue-fg to-blue-600',
    food: 'bg-gradient-to-br from-theme-red-fg to-red-600',
    perfumes: 'bg-gradient-to-br from-theme-gold-fg to-amber-500',
    // --- UPDATED: "All" now uses the blue gradient ---
    All: 'bg-gradient-to-br from-theme-blue-fg to-blue-600',
};

export default function CategoryItem({ name, Icon, isSelected }: CategoryItemProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleClick = () => {
        const currentQuery = new URLSearchParams(Array.from(searchParams.entries()));
        if (name === 'All') {
            currentQuery.delete('category');
        } else {
            currentQuery.set('category', name);
        }
        currentQuery.delete('q'); // remove search query
        const search = currentQuery.toString();
        router.push(`/${search ? `?${search}` : ''}`);
    };

    // Get the specific gradient for this category
    const gradientClass = categoryGradients[name] || 'bg-gradient-to-br from-gray-600 to-gray-800';

    return (
        <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer group min-w-[64px] md:min-w-[80px]"
            title={name}
        >
            <div
                className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center',
                    'transition-all duration-200 ease-out-expo border', // Base transition
                    isSelected
                        ? // --- SELECTED ("Pressed") 3D STATE ---
                        `${gradientClass} shadow-inner scale-95 translate-y-px border-black/20`
                        : // --- UNSELECTED ("Raised" 3D) STATE ---
                        'bg-white/80 backdrop-blur-md shadow-lg border-b-4 border-gray-200/80 border-white/30',

                    // Hover & Active effects for unselected state
                    !isSelected && 'group-hover:scale-105 group-hover:shadow-lifted group-hover:-translate-y-0.5',
                    'group-active:scale-95 group-active:translate-y-px' // Active press effect
                )}
            >
                <Icon
                    className={cn(
                        'h-8 w-8 md:h-10 md:w-10 transition-colors duration-300',
                        // Icon is white when selected
                        isSelected ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                    )}
                    strokeWidth={isSelected ? 2 : 1.5}
                />
            </div>
            <p
                className={cn(
                    'text-xs md:text-sm font-medium capitalize text-center truncate w-full transition-colors',

                    // --- UPDATED: Text is white when selected ---
                    isSelected ? 'text-white font-bold' : 'text-gray-500 group-hover:text-dark-gray'
                )}
            >
                {name}
            </p>
        </div>
    );
}