"use client";

import Link from "next/link";
import { Plus, Megaphone, FileText, Archive } from "lucide-react";
import { useMemo, useState } from "react";

import { NoticeTable } from "@/components/notices/notice-table";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import { noticeCategoryLabels, noticeStatusLabels } from "@/lib/notices/constants";
import type { NoticeListItem, NoticeStats } from "@/types/notices";
import { noticeStatuses } from "@/types/notices";
import { AlertCircle } from "lucide-react";

type AdminNoticesManagerProps = {
  notices: NoticeListItem[];
  stats: NoticeStats;
};

export function AdminNoticesManager({ notices, stats }: AdminNoticesManagerProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<NoticeListItem["status"] | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return notices.filter((notice) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        notice.title.toLowerCase().includes(term) ||
        notice.content.toLowerCase().includes(term);
      const matchesStatus = status === "all" || notice.status === status;
      const matchesCategory = category === "all" || notice.category === category;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [notices, search, status, category]);

  return (
    <>
      {/* Page Header */}
      <div className="mb-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Dashboard</span>
            <span className="text-outline">/</span>
            <span className="font-bold text-primary">Notices</span>
          </div>
          <h2 className="text-headline-lg text-on-surface">Notice & Announcements</h2>
        </div>
        <div>
          <Link
            href="/admin/notices/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-md py-2.5 text-label-md font-semibold text-on-primary hover:bg-primary/95 shadow-sm transition-all"
          >
            <Plus className="size-4" />
            Create Notice
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-3 mb-xl">
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Megaphone className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Published</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.published}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300">
            <FileText className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Drafts</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.drafts}</h4>
          </div>
        </div>
        <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-300">
            <Archive className="size-6" />
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-medium">Archived</p>
            <h4 className="text-headline-md font-bold text-on-surface leading-none mt-1">{stats.archived}</h4>
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
          onChange={(e) => setStatus(e.target.value as NoticeListItem["status"] | "all")}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {noticeStatuses.map((value) => (
            <option key={value} value={value}>
              {noticeStatusLabels[value]}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-w-[140px] rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 text-body-lg md:text-body-md text-on-surface-variant cursor-pointer focus:outline-none"
        >
          <option value="all">All Categories</option>
          {Object.entries(noticeCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        
        <div className="flex-grow max-w-xs md:max-w-sm ml-md">
          <SearchInput
            placeholder="Search titles, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ml-auto text-label-md text-on-surface-variant">
          Showing <span className="font-bold">1-{filtered.length}</span> of{" "}
          <span className="font-bold">{notices.length}</span> notices
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No notices found"
          description="Try adjusting your search query or status/category filters, or click Create Notice above to log one."
        />
      ) : (
        <NoticeTable notices={filtered} />
      )}
    </>
  );
}
