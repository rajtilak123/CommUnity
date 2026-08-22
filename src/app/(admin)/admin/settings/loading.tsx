import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-xl animate-pulse max-w-container-max mx-auto px-margin-mobile sm:px-md py-md">
      {/* ── HEADER SKELETON ──────────────────────────────────── */}
      <div className="border-b border-outline-variant/60 pb-md mb-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm">
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48 mt-xs" />
            <Skeleton className="h-4 w-96 mt-xs" />
            <div className="mt-xs flex gap-x-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="md:text-right space-y-xs">
            <Skeleton className="h-4 w-36 ml-auto" />
            <Skeleton className="h-3 w-28 ml-auto mt-xs" />
          </div>
        </div>
      </div>

      {/* ── CONTENT GRID SKELETON ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Sidebar Skeleton */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-xs overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-outline-variant/60 pr-0 lg:pr-md">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* Right Content Panel Skeleton */}
        <div className="lg:col-span-9 space-y-lg">
          {/* Main Card Skeleton */}
          <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-md">
            <div className="flex items-center gap-sm">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-6 w-48" />
            </div>
            
            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-36 rounded-lg mt-md" />
            </div>
          </div>

          {/* Stats / Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-[0.75rem] border border-outline-variant bg-surface p-md flex items-center gap-md">
                <Skeleton className="size-12 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
