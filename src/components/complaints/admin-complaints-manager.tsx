"use client";

import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ComplaintTable } from "@/components/complaints/complaint-table";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { complaintCategoryLabels } from "@/lib/complaints/constants";
import type { ComplaintListItem } from "@/types/complaints";
import type { ComplaintPriority, ComplaintStatus } from "@/types/ui";
import { complaintPriorities, complaintStatuses } from "@/types/ui";
import { AlertTriangle } from "lucide-react";

type AdminComplaintsManagerProps = {
  complaints: ComplaintListItem[];
};

export function AdminComplaintsManager({ complaints }: AdminComplaintsManagerProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "all">("all");
  const [priority, setPriority] = useState<ComplaintPriority | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return complaints.filter((complaint) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        complaint.title.toLowerCase().includes(term) ||
        complaint.reference_code.toLowerCase().includes(term) ||
        complaint.author?.full_name?.toLowerCase().includes(term);
      const matchesStatus = status === "all" || complaint.status === status;
      const matchesPriority = priority === "all" || complaint.priority === priority;
      const matchesCategory = category === "all" || complaint.category === category;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [complaints, search, status, priority, category]);

  return (
    <>
      <div className="mb-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Dashboard</span>
            <span className="text-outline">/</span>
            <span className="font-bold text-primary">Complaints</span>
          </div>
          <h2 className="text-headline-lg text-on-surface">Complaint Management</h2>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-md py-2 text-label-md transition-colors hover:bg-surface-container-low active:scale-95"
          >
            <Download className="size-4" />
            Export Report
          </button>
          <button
            type="button"
            disabled
            title="Residents raise complaints from the mobile app"
            className="flex items-center gap-2 rounded-lg bg-primary px-md py-2 text-label-md text-on-primary opacity-60 shadow-sm"
          >
            <Plus className="size-4" />
            Log New Complaint
          </button>
        </div>
      </div>

      <div className="mb-lg flex flex-wrap items-center gap-4 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5">
          <span className="text-label-md">Filters</span>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ComplaintStatus | "all")}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant"
        >
          <option value="all">All Statuses</option>
          {complaintStatuses.map((value) => (
            <option key={value} value={value}>
              {value.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as ComplaintPriority | "all")}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant"
        >
          <option value="all">All Priorities</option>
          {complaintPriorities.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant"
        >
          <option value="all">All Categories</option>
          {Object.entries(complaintCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="ml-auto text-label-md text-on-surface-variant">
          Showing <span className="font-bold">1-{filtered.length}</span> of{" "}
          <span className="font-bold">{complaints.length}</span> complaints
        </div>
      </div>

      <div className="mb-lg md:hidden">
        <SearchInput
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No complaints found"
          description="Adjust your filters or wait for residents to submit complaints."
        />
      ) : (
        <ComplaintTable complaints={filtered} />
      )}
    </>
  );
}
