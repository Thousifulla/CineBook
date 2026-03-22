/**
 * Reusable shimmer skeleton loader
 * Uses the `.skeleton` CSS class already defined in index.css
 */
export default function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style = {} }) {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                borderRadius,
                ...style,
            }}
        />
    );
}

/**
 * Movie card skeleton (matches MovieCard dimensions)
 */
export function MovieCardSkeleton() {
    return (
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
            <SkeletonLoader height={260} borderRadius={0} />
            <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SkeletonLoader height={16} width="80%" />
                <SkeletonLoader height={12} width="50%" />
                <SkeletonLoader height={12} width="60%" />
            </div>
        </div>
    );
}

/**
 * Text line skeleton
 */
export function TextSkeleton({ lines = 3, style = {} }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLoader
                    key={i}
                    height={14}
                    width={i === lines - 1 ? '60%' : '100%'}
                />
            ))}
        </div>
    );
}
