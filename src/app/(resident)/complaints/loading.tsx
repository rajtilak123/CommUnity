export default function ComplaintsLoading() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="hidden h-8 w-48 animate-pulse rounded-lg bg-surface-container-high md:block" />
      <div className="h-12 animate-pulse rounded-[0.75rem] bg-surface-container-high" />
      <div className="flex gap-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-surface-container-high" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-[0.75rem] bg-surface-container-high lg:col-span-8" />
        <div className="h-64 animate-pulse rounded-[0.75rem] bg-surface-container-high lg:col-span-4" />
      </div>
    </div>
  );
}
