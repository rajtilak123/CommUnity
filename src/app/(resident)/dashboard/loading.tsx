import { Skeleton } from "@/components/ui/skeleton";

export default function ResidentDashboardLoading() {
  return (
    <div className="space-y-xl animate-pulse max-w-container-max mx-auto px-margin-mobile sm:px-md py-md">
      {/* ── SECTION 1 — HEADER SKELETON ───────────────────────── */}
      <div className="border-b border-outline-variant/60 pb-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm">
          <div>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64 mt-xs" />
            <Skeleton className="h-4 w-48 mt-xs" />
          </div>
          <div className="md:text-right space-y-xs">
            <Skeleton className="h-4 w-36 ml-auto" />
            <Skeleton className="h-3 w-28 ml-auto mt-xs" />
          </div>
        </div>
      </div>

      {/* ── SECTION 2 — OVERVIEW CARDS SKELETON ───────────────── */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg min-h-[140px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="space-y-2 mt-md">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3 — QUICK ACTIONS SKELETON ────────────────── */}
      <section>
        <Skeleton className="h-4 w-32 mb-md" />
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[0.75rem] border border-outline-variant bg-surface p-md"
            >
              <div className="flex items-center gap-md min-w-0 flex-1">
                <Skeleton className="size-12 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="size-4 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ── RESPONSIVE 12-COLUMN MAIN WORKSPACE SKELETON ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* LEFT COLUMN: Main content skeleton */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-8 space-y-xl">
          {/* Notices Feed Skeleton */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col gap-sm">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-md"
                >
                  <div className="flex items-center gap-sm">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="border-t border-outline-variant/60 pt-2 flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Complaints Feed Skeleton */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col gap-sm">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[0.75rem] border border-outline-variant bg-surface p-md flex items-center justify-between"
                >
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-1/2" />
                    <div className="flex items-center gap-xs">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-md shrink-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Side content skeleton */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 space-y-xl">
          {/* Bookings Feed Skeleton */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col gap-sm">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-[0.75rem] border border-outline-variant bg-surface p-md flex flex-col gap-sm"
                >
                  <div className="flex items-center gap-md">
                    <Skeleton className="size-12 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/60 pt-sm">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Summary Skeleton */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md h-[120px] flex items-center justify-center">
              <div className="grid grid-cols-3 gap-sm w-full text-center">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-2 border-x border-outline-variant/40">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-8 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
