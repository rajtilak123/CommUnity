"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Check, CheckSquare, Bell, ExternalLink, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/components/search-input";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notifications/actions";

export type DbNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url: string | null;
  created_at: string;
};

type NotificationsListProps = {
  initialNotifications: DbNotification[];
};

const TYPE_BADGES: Record<string, { label: string; classes: string }> = {
  account: { label: "Account", classes: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20" },
  booking: { label: "Booking", classes: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20" },
  complaint: { label: "Complaint", classes: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20" },
  notice: { label: "Notice", classes: "bg-primary/10 text-primary border-primary/20" },
  community: { label: "Community", classes: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
};

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Instant client-side search & filtering
  const filteredNotifications = useMemo(() => {
    return initialNotifications.filter((n) => {
      const term = search.toLowerCase().trim();
      const matchesSearch =
        !term ||
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !n.is_read) ||
        (statusFilter === "read" && n.is_read);

      const matchesType = typeFilter === "all" || n.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [initialNotifications, search, statusFilter, typeFilter]);

  // Read counters calculated from fresh initialNotifications list
  const totalCount = initialNotifications.length;
  const unreadCount = initialNotifications.filter((n) => !n.is_read).length;
  const readCount = initialNotifications.filter((n) => n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
    });
  };

  return (
    <div className="space-y-md">
      {/* ── Counters row ────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-md max-w-md">
        <button
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-xl border p-sm text-center transition-colors cursor-pointer",
            statusFilter === "all"
              ? "border-primary bg-primary/5 text-primary"
              : "border-outline-variant bg-surface hover:bg-surface-container-low"
          )}
        >
          <p className="text-label-sm font-semibold uppercase tracking-wider text-outline">Total</p>
          <p className="text-headline-sm font-bold text-on-surface mt-xs">{totalCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter("unread")}
          className={cn(
            "rounded-xl border p-sm text-center transition-colors cursor-pointer",
            statusFilter === "unread"
              ? "border-primary bg-primary/5 text-primary"
              : "border-outline-variant bg-surface hover:bg-surface-container-low"
          )}
        >
          <p className="text-label-sm font-semibold uppercase tracking-wider text-outline">Unread</p>
          <p className="text-headline-sm font-bold text-on-surface mt-xs">{unreadCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter("read")}
          className={cn(
            "rounded-xl border p-sm text-center transition-colors cursor-pointer",
            statusFilter === "read"
              ? "border-primary bg-primary/5 text-primary"
              : "border-outline-variant bg-surface hover:bg-surface-container-low"
          )}
        >
          <p className="text-label-sm font-semibold uppercase tracking-wider text-outline">Read</p>
          <p className="text-headline-sm font-bold text-on-surface mt-xs">{readCount}</p>
        </button>
      </div>

      {/* ── Filters Bar ──────────────────────────────────────── */}
      <div className="flex flex-col gap-md border-t border-outline-variant/60 pt-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <SearchInput
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-[0.75rem] border-outline-variant bg-surface py-2.5 pl-10 shadow-sm"
            />
          </div>

          {/* Bulk actions */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="inline-flex items-center gap-xs rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low text-label-md font-semibold px-md py-sm transition-colors text-on-surface cursor-pointer disabled:opacity-50"
            >
              <CheckSquare className="size-4 text-primary" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Type Filter tabs */}
        <div className="flex flex-wrap gap-xs border-b border-outline-variant/40 pb-sm">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "px-3 py-1 rounded-full text-label-sm font-medium border transition-all cursor-pointer",
              typeFilter === "all"
                ? "bg-primary text-on-primary border-primary shadow-sm"
                : "bg-surface hover:bg-surface-container-low border-outline-variant text-on-surface-variant"
            )}
          >
            All Types
          </button>
          {Object.entries(TYPE_BADGES).map(([key, badge]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn(
                "px-3 py-1 rounded-full text-label-sm font-medium border transition-all cursor-pointer capitalize",
                typeFilter === key
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "bg-surface hover:bg-surface-container-low border-outline-variant text-on-surface-variant"
              )}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification List ────────────────────────────────── */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description={
            initialNotifications.length === 0
              ? "No notifications are available right now."
              : "No notifications match your current search/filters."
          }
        />
      ) : (
        <div className="space-y-sm">
          {filteredNotifications.map((notification) => {
            const badge = TYPE_BADGES[notification.type] || { label: notification.type, classes: "bg-slate-500/10 text-slate-700" };
            return (
              <div
                key={notification.id}
                className={cn(
                  "relative rounded-[0.75rem] border p-md md:p-lg transition-all flex items-start justify-between gap-md",
                  notification.is_read
                    ? "border-outline-variant bg-surface hover:bg-surface-container-low"
                    : "border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] shadow-sm"
                )}
              >
                {/* Unread indicator dot */}
                {!notification.is_read && (
                  <span className="absolute left-2 top-2 flex size-2 rounded-full bg-primary" />
                )}

                <div className="space-y-sm min-w-0 flex-1">
                  {/* Badge & Time */}
                  <div className="flex flex-wrap items-center gap-xs">
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-label-sm font-bold uppercase tracking-wide", badge.classes)}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-outline font-semibold flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(notification.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h4 className="text-body-lg font-bold text-on-surface leading-tight">
                      {notification.title}
                    </h4>
                    <p className="text-body-md text-on-surface-variant mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-xs sm:gap-sm shrink-0">
                  {/* Mark as read button */}
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isPending}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-outline-variant bg-surface hover:border-primary hover:text-primary transition-colors cursor-pointer text-on-surface-variant disabled:opacity-50"
                      title="Mark as read"
                    >
                      <Check className="size-4" />
                    </button>
                  )}

                  {/* View Details Navigation */}
                  {notification.link_url && (
                    <Link
                      href={notification.link_url}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:opacity-90 transition-opacity text-on-primary text-label-sm font-semibold px-3 py-1.5 cursor-pointer shadow-sm shrink-0"
                    >
                      View Details
                      <ExternalLink className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
