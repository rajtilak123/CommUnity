import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
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

      {/* ── SECTION 2 — KPI CARDS SKELETON ───────────────────── */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg min-h-[150px]"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="space-y-2 mt-sm">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3 — QUICK ACTIONS SKELETON ────────────────── */}
      <section>
        <Skeleton className="h-4 w-40 mb-md" />
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-[0.75rem] border border-outline-variant bg-surface p-md flex flex-col justify-between gap-sm h-[110px]"
            >
              <Skeleton className="size-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4 — PENDING ACTIONS PANEL SKELETON ────────── */}
      <section className="space-y-md">
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {[...Array(3)].map((_, colIdx) => (
            <div key={colIdx} className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-md">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-xs">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="space-y-sm">
                {[...Array(3)].map((_, rowIdx) => (
                  <div key={rowIdx} className="flex items-center justify-between gap-sm pt-sm first:pt-0">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-7 w-16 rounded shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTIONS 5 & 6 — ACTIVITY & INSIGHTS SKELETON ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Recent Activity Skeletons */}
        <div className="lg:col-span-6 space-y-md">
          <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md md:p-lg space-y-md">
            <div className="relative border-l border-outline-variant/60 ml-3 pl-6 space-y-md">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative space-y-2">
                  <span className="absolute -left-[30px] top-1 flex h-4 w-4 rounded-full border border-surface bg-surface-container-high" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights Skeletons */}
        <div className="lg:col-span-6 space-y-md">
          <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-[0.75rem] border border-outline-variant bg-surface p-md h-[200px] flex flex-col justify-between">
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3.5 w-20 mt-1" />
                </div>
                <Skeleton className="h-[90px] w-full" />
              </div>
            ))}
            <div className="rounded-[0.75rem] border border-outline-variant bg-surface p-md sm:col-span-2 h-[220px] flex flex-col justify-between">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-20 mt-1" />
              </div>
              <div className="space-y-sm">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
