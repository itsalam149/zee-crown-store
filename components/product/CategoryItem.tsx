'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';

interface CategoryItemProps {
    name: string;
    Icon: React.ComponentType<LucideProps>;
    isSelected: boolean;
}

export default function CategoryItem({ name, Icon, isSelected }: CategoryItemProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (name === 'All') {
            current.delete('category');
        } else {
            current.set('category', name);
        }
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
    };

    return (
        <button
            onClick={handleClick}
            className="flex flex-col items-center justify-center space-y-2 group flex-shrink-0 w-full"
        >
            <div
                className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ease-out-expo transform',
                    isSelected
                        ? 'bg-white/20 scale-110' // Selected state on a dark background
                        : 'bg-white/10 group-hover:bg-white/20 group-hover:scale-105' // Unselected state
                )}
            >
                <Icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-semibold capitalize text-white/80">{name}</span>
        </button>
    );
}