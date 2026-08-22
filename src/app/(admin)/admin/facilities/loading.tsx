export default function AdminFacilitiesLoading() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-4 w-72 mt-2 animate-pulse rounded-md bg-surface-container-high" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-lg bg-surface-container-high" />
      </div>

      {/* Facilities Grid Skeleton */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-[0.75rem] border border-outline-variant bg-surface-container-low overflow-hidden">
            <div className="h-48 animate-pulse bg-surface-container-high" />
            <div className="p-md space-y-md">
              <div className="h-6 w-3/4 animate-pulse rounded bg-surface-container-high" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-high" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
