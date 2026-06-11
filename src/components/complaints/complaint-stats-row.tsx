import type { ComplaintStats } from "@/types/complaints";

type ComplaintStatsRowProps = {
  stats: ComplaintStats;
};

export function ComplaintStatsRow({ stats }: ComplaintStatsRowProps) {
  const items = [
    { label: "Total Open", value: stats.open, color: "text-primary" },
    { label: "In Progress", value: stats.in_progress, color: "text-secondary" },
    { label: "Resolved", value: stats.resolved, color: "text-green-600" },
    { label: "High Priority", value: stats.high_priority, color: "text-error" },
  ];

  return (
    <div className="mt-md grid grid-cols-2 gap-md md:grid-cols-4 lg:col-span-12">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md text-center shadow-sm"
        >
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-label-md uppercase text-on-surface-variant">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
