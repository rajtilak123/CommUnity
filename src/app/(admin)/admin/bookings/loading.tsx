export default function AdminBookingsLoading() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-4 w-72 mt-2 animate-pulse rounded-md bg-surface-container-high" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-sm border-b border-outline-variant pb-xs">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded bg-surface-container-high" />
        ))}
      </div>

      {/* Bookings List Table Skeleton */}
      <div className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest overflow-hidden">
        <div className="h-12 border-b border-outline-variant bg-surface-container-low animate-pulse" />
        <div className="p-md space-y-md">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded bg-surface-container-high" />
          ))}
        </div>
      </div>
    </div>
  );
}
