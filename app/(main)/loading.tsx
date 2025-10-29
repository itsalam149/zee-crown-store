import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';

export default function Loading() {
    return (
        <div className="space-y-6 pb-12">
            <div className="relative w-full">
                <div className="w-full h-10 bg-lighter-gray rounded-full" />
            </div>
            <div className="w-full aspect-[2/1] md:aspect-[3/1] bg-lighter-gray rounded-lg animate-pulse" />

            <div className="flex justify-center items-center space-x-4 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 bg-lighter-gray rounded-full" />
                        <div className="h-4 bg-lighter-gray rounded w-12" />
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-center h-8 bg-lighter-gray rounded w-1/3 mx-auto"></h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}