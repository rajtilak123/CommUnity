"use client";

import { AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { NoticeCard } from "@/components/notices/notice-card";
import { NoticeFilters } from "@/components/notices/notice-filters";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import type { NoticeListItem } from "@/types/notices";

type NoticesListProps = {
  notices: NoticeListItem[];
};

export function NoticesList({ notices }: NoticesListProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NoticeListItem["category"] | "all">("all");

  const filtered = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory = category === "all" || notice.category === category;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        notice.title.toLowerCase().includes(term) ||
        notice.content.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [notices, search, category]);

  return (
    <>
      <div className="hidden md:block">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">Notices &amp; Announcements</h2>
      </div>

      <div className="mb-xl flex flex-col gap-md">
        <SearchInput
          placeholder="Search for notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-none border-0 border-b-2 border-outline-variant bg-transparent py-3 pl-10 shadow-none focus:border-primary"
        />
        <NoticeFilters activeCategory={category} onCategoryChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No notices found"
          description={
            notices.length === 0
              ? "There are no notices or announcements posted for your society at this time."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {filtered.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}
    </>
  );
}
