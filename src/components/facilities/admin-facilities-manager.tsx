"use client";

import Link from "next/link";
import { Plus, Wrench, CheckCircle, AlertTriangle, CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";

import { FacilityTable } from "@/components/facilities/facility-table";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import type { FacilityListItem } from "@/types/facilities";
import { AlertCircle } from "lucide-react";

type AdminFacilitiesManagerProps = {
  facilities: FacilityListItem[];
};

export function AdminFacilitiesManager({ facilities }: AdminFacilitiesManagerProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "disabled">("all");

  const stats = useMemo(() => {
    return {
      total: facilities.length,
      active: facilities.filter((f) => f.is_active).length,
      disabled: facilities.filter((f) => !f.is_active).length,
    };
  }, [facilities]);

  const filtered = useMemo(() => {
    return facilities.filter((facility) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        facility.name.toLowerCase().includes(term) ||
        facility.description.toLowerCase().includes(term);
      
      const matchesStatus =
        status === "all" ||
        (status === "active" && facility.is_active) ||
        (status === "disabled" && !facility.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [facilities, search, status]);

  return (
    <>
      {/* Page Header */}
      <div className="mb-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Dashboard</span>
            <span className="text-outline">/</span>
            <span className="font-bold text-primary">Facilities</span>
          </div>
          <h2 className="text-headline-lg text-on-surface">Facilities Management</h2>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 rounded-lg border border-outline px-md py-2.5 text-label-md font-semibold text-on-surface hover:bg-surface-container shadow-sm transition-all"
          >
            <CalendarRange className="size-4 text-primary" />
            Manage Bookings
          </Link>
          <Link
            href="/admin/facilities/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-md py-2.5 text-label-md font-semibold text-on-primary hover:bg-primary/95 shadow-sm transition-all"
          >
            <Plus className="size-4" />
            Create Facility
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3 mb-xl">
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wrench className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Total Amenities</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.total}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Active &amp; Bookable</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.active}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300">
            <AlertTriangle className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Disabled / Offline</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.disabled}</h4>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-lg flex flex-wrap items-center gap-4 rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5">
          <span className="text-label-md">Filters</span>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "active" | "disabled")}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="disabled">Disabled Only</option>
        </select>
        
        <div className="flex-grow max-w-xs md:max-w-sm ml-md">
          <SearchInput
            placeholder="Search facility name, desc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto text-label-md text-on-surface-variant">
          Showing <span className="font-bold">1-{filtered.length}</span> of{" "}
          <span className="font-bold">{facilities.length}</span> facilities
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No facilities found"
          description="Try adjusting your search query or status filter, or click Create Facility above to add one."
        />
      ) : (
        <FacilityTable facilities={filtered} />
      )}
    </>
  );
}
