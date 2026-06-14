import { Skeleton } from '@/components/ui/skeleton';

/**
 * Route-level loading state for the demos index. The catalog is fetched at
 * request time from GitHub Raw (5-minute cache), so a cache-miss navigation
 * previously froze with no feedback; these card-shaped skeletons match the
 * demo-card layout.
 */
export default function DemosLoading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-3 h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div
        className="mt-8 grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[190px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    </main>
  );
}
