import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CalendarRange,
  Info,
  ChevronRight,
  PlusCircle,
  Building2,
  Megaphone,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";

import { requireResident } from "@/lib/auth/session";
import { getResidentDashboardData } from "@/lib/dashboard/queries";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { NoticeCard } from "@/components/notices/notice-card";
import { EmptyState } from "@/components/empty-state";
import { DashboardFacilityImage } from "@/components/facilities/dashboard-facility-image";

export const dynamic = "force-dynamic";

// Robust relative time calculation helper
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isFuture = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const diffMins = Math.floor(absDiffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isFuture) {
    if (diffMins < 1) return "Starting now";
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays === 1) return "Tomorrow";
    return `In ${diffDays} days`;
  } else {
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }
}

export default async function ResidentDashboardPage() {
  const profile = await requireResident();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const {
    stats,
    latestNotices,
    latestComplaints,
    upcomingBookingsList,
  } = await getResidentDashboardData(profile.id, profile.society_id);

  // Time-based greeting logic
  const hour = new Date().getHours();

  let greeting = "Good morning";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  // Current Date
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Complaint Activity text
  let complaintUpdateText = "No recent updates";

  if (stats.latestComplaintUpdate) {
    complaintUpdateText = `Last activity: ${getRelativeTime(
      stats.latestComplaintUpdate,
    )}`;
  }

  // Notice Activity text
  let noticeSubtext = "All caught up";

  if (stats.unreadNotices > 0 && stats.latestUnreadNoticeTitle) {
    noticeSubtext = `Latest: "${stats.latestUnreadNoticeTitle}"`;
  }

  // Booking Activity text
  let bookingSubtext = "No upcoming bookings";

  if (stats.upcomingBookings > 0 && stats.nearestBookingDate) {
    bookingSubtext = `Nearest: ${getRelativeTime(stats.nearestBookingDate)}`;
  }

  return (
    <div className="w-full min-w-0 max-w-container-max mx-auto space-y-xl px-margin-mobile py-md sm:px-md">
      {/* ── SECTION 1 — WELCOME HEADER ─────────────────────────── */}
      <div className="border-b-2 border-primary pb-md">
        <div className="flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-on-surface-variant mb-1">
              RESIDENT PORTAL — EDITION {new Date().getFullYear()}
            </p>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
              {greeting},{" "}
              {profile.full_name
                ? profile.full_name.split(" ")[0]
                : "Resident"}
            </h1>

            <p className="mt-xs text-body-md font-medium text-on-surface-variant font-mono">
              Unit {profile.unit_label || "N/A"}
            </p>
          </div>

          <div className="md:text-right">
            <p className="font-mono text-xs font-semibold text-on-surface-variant">
              {formattedDate}
            </p>

            <p className="mt-xs font-mono text-xs text-outline uppercase tracking-wider">
              CommUnity Brief
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 2 — EXECUTIVE OVERVIEW CARDS ────────────────── */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1 — Open Complaints */}
        <Link
          href="/complaints"
          className="group flex min-h-[130px] flex-col justify-between rounded-none border border-outline-variant bg-surface p-md transition-all hover:border-primary hover:bg-surface-container-low"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Open Complaints
            </span>

            <span className="text-accent">
              <AlertTriangle className="size-4" />
            </span>
          </div>

          <div className="mt-md">
            <span className="font-mono text-3xl font-bold leading-none text-on-surface">
              {stats.complaintsOpen}
            </span>

            <p
              className="mt-xs truncate text-xs font-mono text-outline"
              title={complaintUpdateText}
            >
              {complaintUpdateText}
            </p>
          </div>
        </Link>

        {/* CARD 2 — Unread Notices */}
        <Link
          href="/notices"
          className="group flex min-h-[130px] flex-col justify-between rounded-none border border-outline-variant bg-surface p-md transition-all hover:border-primary hover:bg-surface-container-low"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Unread Notices
            </span>

            <span className="text-primary">
              <Bell className="size-4" />
            </span>
          </div>

          <div className="mt-md">
            <span className="font-mono text-3xl font-bold leading-none text-on-surface">
              {stats.unreadNotices}
            </span>

            <p
              className="mt-xs truncate text-xs font-mono text-outline"
              title={stats.latestUnreadNoticeTitle || ""}
            >
              {noticeSubtext}
            </p>
          </div>
        </Link>

        {/* CARD 3 — Upcoming Bookings */}
        <Link
          href="/facilities/bookings"
          className="group flex min-h-[130px] flex-col justify-between rounded-none border border-outline-variant bg-surface p-md transition-all hover:border-primary hover:bg-surface-container-low"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Upcoming Bookings
            </span>

            <span className="text-primary">
              <CalendarRange className="size-4" />
            </span>
          </div>

          <div className="mt-md">
            <span className="font-mono text-3xl font-bold leading-none text-on-surface">
              {stats.upcomingBookings}
            </span>

            <p
              className="mt-xs truncate text-xs font-mono text-outline"
              title={bookingSubtext}
            >
              {bookingSubtext}
            </p>
          </div>
        </Link>

        {/* CARD 4 — Community Snapshot */}
        <Link
          href="/facilities"
          className="group flex min-h-[130px] flex-col justify-between rounded-none border border-outline-variant bg-surface p-md transition-all hover:border-primary hover:bg-surface-container-low"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Community Summary
            </span>

            <span className="text-primary">
              <Info className="size-4" />
            </span>
          </div>

          <div className="mt-md">
            <span className="font-mono text-3xl font-bold leading-none text-on-surface">
              {stats.activeFacilities}
            </span>

            <p className="mt-xs text-xs font-mono text-outline">
              {stats.noticesThisMonth} published this month
            </p>
          </div>
        </Link>
      </div>

      {/* ── SECTION 3 — QUICK ACTIONS ─────────────────────────── */}
      <section>
        <h2 className="mb-md text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
          {/* Raise Complaint */}
          <Link
            href="/complaints/new"
            className="group flex h-full items-center justify-between rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-low hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 items-center gap-md">
              <span className="shrink-0 rounded-lg bg-amber-500/10 p-3 text-amber-600 transition-transform group-hover:scale-105 dark:text-amber-400">
                <PlusCircle className="size-6" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                  Raise Complaint
                </h3>

                <p className="truncate text-body-sm text-on-surface-variant">
                  File a maintenance issue
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-outline transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </Link>

          {/* Browse Facilities */}
          <Link
            href="/facilities"
            className="group flex h-full items-center justify-between rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-low hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 items-center gap-md">
              <span className="shrink-0 rounded-lg bg-violet-500/10 p-3 text-violet-600 transition-transform group-hover:scale-105 dark:text-violet-400">
                <Building2 className="size-6" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                  Browse Facilities
                </h3>

                <p className="truncate text-body-sm text-on-surface-variant">
                  Reserve amenities
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-outline transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </Link>

          {/* View Notices */}
          <Link
            href="/notices"
            className="group flex h-full items-center justify-between rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-low hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 items-center gap-md">
              <span className="shrink-0 rounded-lg bg-primary/10 p-3 text-primary transition-transform group-hover:scale-105">
                <Megaphone className="size-6" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                  View Notices
                </h3>

                <p className="truncate text-body-sm text-on-surface-variant">
                  Read bulletin board
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-outline transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </Link>

          {/* My Bookings */}
          <Link
            href="/facilities/bookings"
            className="group flex h-full items-center justify-between rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-low hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 items-center gap-md">
              <span className="shrink-0 rounded-lg bg-emerald-500/10 p-3 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
                <CalendarCheck className="size-6" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                  My Bookings
                </h3>

                <p className="truncate text-body-sm text-on-surface-variant">
                  Track reservations
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 shrink-0 text-outline transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </div>
      </section>

      {/* ── RESPONSIVE 12-COLUMN MAIN WORKSPACE ────────────────── */}
      <div className="grid w-full min-w-0 grid-cols-1 items-start gap-gutter lg:grid-cols-12">

        {/* LEFT COLUMN */}
        <div className="col-span-1 min-w-0 space-y-xl lg:col-span-7 xl:col-span-8">

          {/* SECTION 4 — RECENT NOTICES */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <h2 className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                Recent Notices
              </h2>

              <Link
                href="/notices"
                className="flex items-center gap-1 rounded text-label-md font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                View all
                <ChevronRight className="size-4" />
              </Link>
            </div>

            {latestNotices.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="No notices published"
                description="Announcements and bulletins from society administration will appear here."
              />
            ) : (
              <div className="flex flex-col gap-sm">
                {latestNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
          </section>

          {/* SECTION 5 — MY RECENT COMPLAINTS */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <h2 className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                My Recent Complaints
              </h2>

              <Link
                href="/complaints"
                className="flex items-center gap-1 rounded text-label-md font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                View all
                <ChevronRight className="size-4" />
              </Link>
            </div>

            {latestComplaints.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No complaints yet"
                description="Have an issue? Raise a complaint to get assistance from the administration team."
                action={
                  <Link
                    href="/complaints/new"
                    className="inline-flex items-center gap-xs rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Raise Complaint
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-col gap-sm">
                {latestComplaints.map((complaint) => (
                  <Link
                    key={complaint.id}
                    href={`/complaints/${complaint.id}`}
                    className="group block rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex flex-col justify-between gap-sm sm:flex-row sm:items-center">
                      <div className="space-y-1">
                        <h4 className="leading-tight text-body-lg font-bold text-on-surface transition-colors group-hover:text-primary">
                          {complaint.title}
                        </h4>

                        <div className="flex items-center gap-xs text-label-md text-outline">
                          <span className="rounded bg-surface-container-high px-2 py-0.5 font-medium capitalize text-on-surface-variant">
                            {complaint.category}
                          </span>

                          <span>•</span>

                          <span>Ref: {complaint.reference_code}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-sm sm:justify-end">
                        <span className="text-label-md font-semibold text-outline">
                          {getRelativeTime(complaint.created_at)}
                        </span>

                        <PriorityBadge
                          priority={complaint.priority}
                          className="origin-left scale-90"
                        />

                        <StatusBadge status={complaint.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-1 min-w-0 space-y-xl lg:col-span-5 xl:col-span-4">

          {/* SECTION 6 — UPCOMING RESERVATIONS */}
          <section className="w-full min-w-0 space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <h2 className="min-w-0 text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                Upcoming Reservations
              </h2>

              <Link
                href="/facilities/bookings"
                className="flex shrink-0 items-center gap-1 rounded text-label-md font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                View all
                <ChevronRight className="size-4" />
              </Link>
            </div>

            {upcomingBookingsList.length === 0 ? (
              /*
               * Explicit empty-state markup for this narrow sidebar card.
               * This avoids the intrinsic-width behavior that was causing
               * the description to collapse into a narrow vertical column.
               */
              <div className="w-full min-w-0 rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-md py-xl text-center md:px-lg">
                <div className="flex w-full min-w-0 flex-col items-center justify-center">
                  <div className="mb-md flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                    <CalendarDays className="size-6" />
                  </div>

                  <div className="w-full max-w-md mx-auto space-y-sm text-center">
                    <h3 className="w-full font-serif text-headline-sm text-on-surface">
                      No upcoming bookings
                    </h3>

                    <p className="w-full text-center text-body-md text-on-surface-variant leading-relaxed">
                      Book clubhouse slots, sports grounds, and other facilities online.
                    </p>
                  </div>

                  <div className="mt-lg flex w-full justify-center">
                    <Link
                      href="/facilities"
                      className="inline-flex items-center gap-xs rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Book Facility
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                {upcomingBookingsList.map((booking) => {
                  const bookingDateStr = new Date(
                    booking.start_time,
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const timeSlotStr = formatTimeSlot(
                    booking.start_time,
                    booking.end_time,
                  );

                  const imageUrl = booking.facility?.images?.[0]?.file_url;

                  return (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-sm rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md transition-all duration-300 hover:border-primary"
                    >
                      <div className="flex min-w-0 items-center gap-md">
                        <DashboardFacilityImage
                          fileUrl={imageUrl}
                          facilityName={
                            booking.facility?.name || "Facility"
                          }
                        />

                        <div className="min-w-0">
                          <h4 className="truncate text-body-lg font-bold text-on-surface">
                            {booking.facility?.name || "Facility"}
                          </h4>

                          <p className="text-body-md font-medium text-on-surface-variant">
                            {bookingDateStr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-outline-variant/40 pt-sm">
                        <span className="rounded bg-surface-container-high px-2.5 py-1 font-mono text-label-sm text-on-surface-variant">
                          {timeSlotStr}
                        </span>

                        <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-label-sm font-semibold capitalize text-emerald-700">
                          Approved
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 7 — COMMUNITY SUMMARY */}
          <section className="space-y-sm">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <h2 className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                Community Summary
              </h2>
            </div>

            <div className="space-y-md rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <div className="grid grid-cols-3 gap-sm text-center">
                <div className="space-y-1">
                  <span className="block text-headline-md font-extrabold leading-none text-primary">
                    {stats.activeFacilities}
                  </span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Facilities
                  </p>
                </div>

                <div className="space-y-1 border-x border-outline-variant/40">
                  <span className="block text-headline-md font-extrabold leading-none text-on-surface">
                    {stats.approvedResidents}
                  </span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Residents
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="block text-headline-md font-extrabold leading-none text-on-surface">
                    {stats.noticesThisMonth}
                  </span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-outline">
                    Notices
                  </p>
                </div>
              </div>

              <div className="border-t border-outline-variant/40 pt-md text-center">
                <Link
                  href="/facilities"
                  className="flex items-center justify-center gap-1 rounded py-1 text-label-md font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Browse Amenities
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Time slot formatting helper ───────────────────────────────────────────────

function formatTimeSlot(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const startStrTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endStrTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${startStrTime} - ${endStrTime}`;
}