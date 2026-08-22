export default function NoticesLoading() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-surface-container-high" />
        </div>
      </div>
      
      {/* Category Tabs Skeleton */}
      <div className="flex gap-sm">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-surface-container-high" />
        ))}
      </div>

      {/* Notices Grid/Stack Skeleton */}
      <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-[0.75rem] bg-surface-container-high" />
        ))}
      </div>
    </div>
  );
}
