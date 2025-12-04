// Reusable Skeleton Components for Loading States

export function MovieCardSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-pulse">
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] bg-gradient-to-br from-purple-900/20 to-pink-900/20" />

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-6 bg-white/10 rounded-lg w-3/4" />

                {/* Genre & Duration */}
                <div className="flex gap-2">
                    <div className="h-4 bg-white/10 rounded w-20" />
                    <div className="h-4 bg-white/10 rounded w-16" />
                </div>

                {/* Rating Badge */}
                <div className="h-8 bg-white/10 rounded-full w-24" />
            </div>
        </div>
    );
}

export function MovieGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="relative h-[600px] overflow-hidden animate-pulse">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40" />

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                <div className="max-w-2xl space-y-6">
                    {/* Title */}
                    <div className="h-16 bg-white/10 rounded-lg w-3/4" />

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-5/6" />
                        <div className="h-4 bg-white/10 rounded w-4/6" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <div className="h-12 bg-white/10 rounded-xl w-40" />
                        <div className="h-12 bg-white/10 rounded-xl w-40" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AdSliderSkeleton() {
    return (
        <div className="relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        </div>
    );
}

export function ShowtimeCardSkeleton() {
    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 animate-pulse">
            {/* Theater Name */}
            <div className="h-6 bg-white/10 rounded-lg w-1/2 mb-4" />

            {/* Showtime Buttons */}
            <div className="flex flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-white/10 rounded-xl w-24" />
                ))}
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="bg-white/5 p-4 border-b border-white/10">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, i) => (
                        <div key={i} className="h-5 bg-white/10 rounded" />
                    ))}
                </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/10">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div key={rowIdx} className="p-4 animate-pulse">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                            {Array.from({ length: cols }).map((_, colIdx) => (
                                <div key={colIdx} className="h-4 bg-white/10 rounded" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="space-y-6 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 animate-pulse">
            {/* Title */}
            <div className="h-8 bg-white/10 rounded-lg w-1/3" />

            {/* Form Fields */}
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-24" />
                    <div className="h-12 bg-white/10 rounded-lg" />
                </div>
            ))}

            {/* Submit Button */}
            <div className="h-12 bg-white/10 rounded-xl w-full" />
        </div>
    );
}
