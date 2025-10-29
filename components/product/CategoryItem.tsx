'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItemProps {
    name: string;
    Icon: LucideIcon;
    isSelected: boolean;
}

const categoryColors: { [key: string]: string } = {
    medicine: 'bg-theme-green text-white',
    cosmetics: 'bg-theme-blue text-white',
    food: 'bg-theme-red text-white',
    perfumes: 'bg-theme-gold text-white',
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

    const themeClass = categoryColors[name] || 'bg-gray-100 text-gray-800';

    return (
        <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer group min-w-[64px]"
        >
            <div
                className={cn(
                    'w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-sm',
                    isSelected
                        ? `${themeClass} scale-105 shadow-lg`
                        : 'bg-white group-hover:bg-gray-100 group-hover:scale-105'
                )}
            >
                <Icon
                    className={cn(
                        'h-1/2 w-1/2 md:h-3/4 md:w-3/4 transition-colors',
                        isSelected ? 'text-inherit' : 'text-gray-400'
                    )}
                />
            </div>
            <p
                className={cn(
                    'text-xs md:text-sm font-medium capitalize text-center truncate w-full transition-colors',
                    isSelected ? 'text-gray-800 font-bold' : 'text-gray-500'
                )}
            >
                {name}
            </p>
        </div>
    );
}
