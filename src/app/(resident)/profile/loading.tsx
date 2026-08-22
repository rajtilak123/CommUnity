export default function ProfileLoading() {
  return (
    <div className="flex flex-col gap-lg max-w-4xl mx-auto">
      {/* Page Header Skeleton */}
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-container-high" />

      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {/* Left Column: User Profile Card Skeleton */}
        <div className="md:col-span-1 flex flex-col items-center rounded-[0.75rem] border border-outline-variant bg-surface p-md space-y-md">
          <div className="size-24 animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-6 w-32 animate-pulse rounded bg-surface-container-high" />
          <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
          <div className="w-full border-t border-outline-variant pt-md space-y-sm">
            <div className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-high" />
          </div>
        </div>

        {/* Right Column: Profile Form / Details Skeleton */}
        <div className="md:col-span-2 rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-lg">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-container-high" />
          
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface-container-high" />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-md">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-surface-container-high" />
          </div>
        </div>
      </div>
    </div>
  );
}
