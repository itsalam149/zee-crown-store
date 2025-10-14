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
        current.set('category', name);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex flex-col items-center justify-center space-y-2 group flex-shrink-0',
                isSelected ? 'text-primary' : 'text-gray-500'
            )}
        >
            <div
                className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary text-white' : 'bg-lighter-gray text-dark-gray group-hover:bg-light'
                )}
            >
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium capitalize">{name}</span>
        </button>
    );
}