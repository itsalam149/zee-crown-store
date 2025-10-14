'use client';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export function SearchBar({ initialQuery }: { initialQuery?: string }) {
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

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                type="text"
                placeholder="Search products..."
                defaultValue={initialQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
            />
        </div>
    );
}