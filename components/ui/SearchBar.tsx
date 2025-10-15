'use client';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

interface SearchBarProps {
    initialQuery?: string;
    onFocus?: () => void;
    onBlur?: () => void;
}

export function SearchBar({ initialQuery, onFocus, onBlur }: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(window.location.search);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        // When searching, reset category to 'All'
        params.delete('category');

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <input
                type="text"
                placeholder="Search products..."
                defaultValue={initialQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                className="w-full pl-12 pr-4 py-3 border-none bg-white/70 rounded-full focus:ring-2 focus:ring-primary focus:outline-none focus:bg-white transition-all"
            />
        </div>
    );
}