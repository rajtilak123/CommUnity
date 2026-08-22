"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, ChevronRight } from "lucide-react";
import type { Profile } from "@/types/auth";
import { SearchInput } from "@/components/search-input";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type ResidentsListProps = {
  residents: Profile[];
};

export function ResidentsList({ residents }: ResidentsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  // Filtering logic
  const filteredResidents = residents.filter((resident) => {
    const searchString = `${resident.full_name || ""} ${resident.email || ""} ${resident.phone || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || resident.status === statusFilter;
    const matchesRole = roleFilter === "all" || resident.role === roleFilter;

    let matchesActive = true;
    if (activeFilter === "active") {
      matchesActive = resident.is_active;
    } else if (activeFilter === "inactive") {
      matchesActive = !resident.is_active;
    }

    return matchesSearch && matchesStatus && matchesRole && matchesActive;
  });

  const columns = [
    {
      id: "name",
      header: "Resident",
      cell: (resident: Profile) => (
        <div className="flex items-center gap-md">
          <div className="flex size-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
            {resident.full_name ? resident.full_name[0].toUpperCase() : resident.email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-on-surface">
              {resident.full_name || "Unknown Name"}
            </div>
            <div className="text-body-sm text-on-surface-variant">
              {resident.email}
            </div>
            {resident.phone && (
              <div className="text-body-xs text-on-surface-variant">
                {resident.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (resident: Profile) => (
        <div className="flex items-center gap-sm">
          {resident.role === "admin" ? (
            <span className="inline-flex items-center gap-1 rounded bg-primary-container/20 px-2 py-0.5 text-label-sm font-semibold uppercase text-primary">
              <Shield className="size-3" /> Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-secondary-container/20 px-2 py-0.5 text-label-sm font-semibold uppercase text-secondary">
              <User className="size-3" /> Resident
            </span>
          )}
        </div>
      ),
    },
    {
      id: "unit",
      header: "Unit",
      cell: (resident: Profile) => (
        <div>
          {resident.unit_label ? (
            <span className="rounded-full border border-outline-variant bg-surface-container px-2.5 py-0.5 text-label-sm font-semibold text-on-surface-variant">
              {resident.unit_label}
            </span>
          ) : (
            <span className="text-body-sm text-outline-variant italic">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (resident: Profile) => {
        let statusClass = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
        if (resident.status === "approved") {
          statusClass = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
        } else if (resident.status === "rejected") {
          statusClass = "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
        }

        return (
          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider", statusClass)}>
            {resident.status}
          </span>
        );
      },
    },
    {
      id: "active",
      header: "Account State",
      cell: (resident: Profile) => (
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", resident.is_active ? "bg-emerald-500" : "bg-outline-variant")} />
          <span className="text-body-sm">
            {resident.is_active ? "Active" : "Suspended"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end text-on-surface-variant">
          <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
        </div>
      ),
      className: "w-10",
    },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or phone..."
          className="w-full md:w-80"
        />
        <div className="flex flex-wrap items-center gap-sm">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg md:text-label-md outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg md:text-label-md outline-none focus:border-primary"
          >
            <option value="all">All Roles</option>
            <option value="resident">Resident</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg md:text-label-md outline-none focus:border-primary"
          >
            <option value="all">All States</option>
            <option value="active">Active Only</option>
            <option value="inactive">Suspended Only</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredResidents}
        getRowKey={(resident) => resident.id}
        onRowClick={(resident) => router.push(`/admin/residents/${resident.id}`)}
        emptyState={
          <EmptyState
            title="No residents found"
            description="Adjust your search query or filters to find other resident profiles."
          />
        }
      />
    </div>
  );
}
