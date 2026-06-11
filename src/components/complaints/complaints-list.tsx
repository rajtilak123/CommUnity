"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ComplaintCard } from "@/components/complaints/complaint-card";
import { ComplaintFilters } from "@/components/complaints/complaint-filters";
import { ComplaintStatsRow } from "@/components/complaints/complaint-stats-row";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import type { ComplaintListItem, ComplaintStats } from "@/types/complaints";
import type { ComplaintStatus } from "@/types/ui";
import { AlertTriangle } from "lucide-react";

type ComplaintsListProps = {
  complaints: ComplaintListItem[];
  stats: ComplaintStats;
};

export function ComplaintsList({ complaints, stats }: ComplaintsListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "all">("all");

  const filtered = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesStatus = status === "all" || complaint.status === status;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        complaint.title.toLowerCase().includes(term) ||
        complaint.description.toLowerCase().includes(term) ||
        complaint.reference_code.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [complaints, search, status]);

  return (
    <>
      <div className="hidden md:block">
        <h2 className="text-headline-lg text-on-surface">My Complaints</h2>
      </div>

      <div className="mb-xl flex flex-col gap-md">
        <SearchInput
          placeholder="Search for complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-[0.75rem] border-outline-variant bg-surface py-3 pl-12 shadow-sm"
        />
        <ComplaintFilters activeStatus={status} onStatusChange={setStatus} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No complaints found"
          description={
            complaints.length === 0
              ? "You haven't raised any complaints yet. Tap the button below to get started."
              : "Try adjusting your search or filters."
          }
          action={
            complaints.length === 0 ? (
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-md py-sm text-label-md font-semibold text-on-primary"
              >
                <Plus className="size-4" />
                Raise Complaint
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          {filtered.map((complaint, index) => {
            if (index === 0) {
              return <ComplaintCard key={complaint.id} complaint={complaint} variant="featured" />;
            }
            if (index === 1) {
              return <ComplaintCard key={complaint.id} complaint={complaint} variant="sidebar" />;
            }
            return <ComplaintCard key={complaint.id} complaint={complaint} variant="compact" />;
          })}
          <ComplaintStatsRow stats={stats} />
        </div>
      )}

      <Link
        href="/complaints/new"
        className="fixed bottom-24 right-margin-mobile z-50 flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-on-primary shadow-2xl transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-90 md:bottom-lg md:right-lg"
      >
        <Plus className="size-5" />
        <span className="text-label-md font-bold">Raise Complaint</span>
      </Link>
    </>
  );
}
