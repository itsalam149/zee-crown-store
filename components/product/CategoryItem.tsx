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
    All: 'bg-gradient-to-br from-gray-500 to-gray-700',
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
    const gradientClass = categoryGradients[name] || 'bg-gradient-to-br from-gray-500 to-gray-700';

    return (
        <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer group min-w-[64px] md:min-w-[80px]"
            title={name}
        >
            <div
                className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center',
                    'transition-all duration-300 ease-out-expo border',
                    isSelected
                        ? // --- SELECTED ("Pressed") STATE ---
                        `${gradientClass} shadow-inner scale-95 border-white/30`
                        : // --- UNSELECTED ("Raised" Glass) STATE ---
                        'bg-white/60 backdrop-blur-md shadow-medium border-white/30 group-hover:scale-105 group-hover:shadow-lifted'
                )}
            >
                <Icon
                    className={cn(
                        'h-8 w-8 md:h-10 md:w-10 transition-colors duration-300',
                        isSelected ? 'text-white' : 'text-gray-500 group-hover:text-primary'
                    )}
                    strokeWidth={isSelected ? 2 : 1.5} // Bolder icon when selected
                />
            </div>
            <p
                className={cn(
                    'text-xs md:text-sm font-medium capitalize text-center truncate w-full transition-colors',
                    isSelected ? 'text-dark-gray font-bold' : 'text-gray-500 group-hover:text-dark-gray'
                )}
            >
                {name}
            </p>
        </div>
    );
}