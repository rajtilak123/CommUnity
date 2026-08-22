import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-xl max-w-container-max mx-auto px-margin-mobile sm:px-md py-md animate-pulse">
      {/* Header Placeholder */}
      <div className="border-b border-outline-variant/60 pb-md">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64 mt-xs" />
        <Skeleton className="h-4 w-full max-w-md mt-xs" />
      </div>

      {/* Stats Counter Placeholder */}
      <div className="grid grid-cols-3 gap-md max-w-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface p-sm text-center">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-6 w-8 mx-auto mt-xs" />
          </div>
        ))}
      </div>

      {/* Filters and Actions Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md border-t border-outline-variant/60 pt-md">
        {/* Filters Tabs Placeholder */}
        <div className="flex gap-sm">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        {/* Bulk Action Placeholder */}
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Notifications List Placeholder */}
      <div className="space-y-md pt-sm">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-md rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-xs">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-col items-end gap-sm shrink-0">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
