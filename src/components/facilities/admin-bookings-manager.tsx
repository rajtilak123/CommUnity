"use client";

import { useMemo, useState } from "react";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import { AdminBookingsTable } from "@/components/facilities/admin-bookings-table";
import type { BookingListItem } from "@/types/facilities";
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type AdminBookingsManagerProps = {
  bookings: BookingListItem[];
};

export function AdminBookingsManager({ bookings }: AdminBookingsManagerProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected" | "cancelled">("all");

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      approved: bookings.filter((b) => b.status === "approved").length,
      others: bookings.filter((b) => b.status === "rejected" || b.status === "cancelled").length,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (booking.resident?.full_name || "").toLowerCase().includes(term) ||
        (booking.facility?.name || "").toLowerCase().includes(term);

      const matchesStatus =
        status === "all" || booking.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, status]);

  return (
    <>
      {/* Page Header */}
      <div className="mb-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-label-md text-on-surface-variant">
            <Link href="/admin/facilities" className="hover:text-primary transition-all">
              Facilities
            </Link>
            <span className="text-outline">/</span>
            <span className="font-bold text-primary">Bookings</span>
          </div>
          <h2 className="text-headline-lg text-on-surface">Facility Bookings</h2>
        </div>
        <div>
          <Link
            href="/admin/facilities"
            className="flex items-center gap-2 rounded-lg border border-outline px-md py-2.5 text-label-md font-semibold text-on-surface hover:bg-surface-container shadow-sm transition-all"
          >
            <ChevronLeft className="size-4" />
            Manage Facilities
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-4 mb-xl">
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Total Bookings</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.total}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Pending Review</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.pending}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Approved</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.approved}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-error/10 text-error">
            <XCircle className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Rejected / Cancelled</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.others}</h4>
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
          onChange={(e) => setStatus(e.target.value as "all" | "pending" | "approved" | "rejected" | "cancelled")}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant cursor-pointer focus:outline-none"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex-grow max-w-xs md:max-w-sm ml-md">
          <SearchInput
            placeholder="Search resident name or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto text-label-md text-on-surface-variant">
          Showing <span className="font-bold">1-{filtered.length}</span> of{" "}
          <span className="font-bold">{bookings.length}</span> records
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No booking records found"
          description="No bookings match your current search queries or filter choices."
        />
      ) : (
        <AdminBookingsTable bookings={filtered} />
      )}
    </>
  );
}
