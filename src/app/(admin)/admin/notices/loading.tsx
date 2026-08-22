export default function AdminNoticesLoading() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-4 w-72 mt-2 animate-pulse rounded-md bg-surface-container-high" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-container-high" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-[0.75rem] bg-surface-container-high" />
        ))}
      </div>

      {/* Notices Table Skeleton */}
      <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="h-12 border-b border-outline-variant bg-surface-container-low animate-pulse" />
        <div className="p-md space-y-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
      </div>
    </div>
  );
}
