'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    onSearch?: () => void;
    autoFocus?: boolean;
    className?: string;
    placeholder?: string;
}

export default function SearchBar({ 
    onSearch, 
    autoFocus = false, 
    className,
    placeholder = "Search products..."
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            onSearch?.();
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    return (
        <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
            <div className={cn(
                "relative flex items-center transition-all duration-200",
                isFocused ? "ring-2 ring-primary ring-opacity-50" : ""
            )}>
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className={cn(
                        "w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "bg-white text-gray-900 placeholder-gray-500",
                        "transition-all duration-200"
                    )}
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </form>
    );
}