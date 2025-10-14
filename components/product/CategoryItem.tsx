'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryItemProps {
    name: string;
    Icon: LucideIcon;
    isSelected: boolean;
}

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

        const search = currentQuery.toString();
        const query = search ? `?${search}` : '';

        router.push(`/${query}`);
    };

    return (
        <div
            onClick={handleClick}
            className="flex flex-col items-center justify-center gap-2 cursor-pointer flex-shrink-0 w-20"
        >
            <div
                className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                    isSelected ? 'bg-primary scale-110' : 'bg-primary/20 group-hover:bg-primary/30'
                )}
            >
                <Icon className={cn('h-8 w-8 transition-colors', isSelected ? 'text-white' : 'text-primary/80')} />
            </div>
            <p className={cn('text-xs font-semibold capitalize transition-colors', isSelected ? 'text-white' : 'text-white/70')}>
                {name}
            </p>
        </div>
    );
}