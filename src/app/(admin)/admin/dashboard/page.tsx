import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Users,
  AlertTriangle,
  Building,
  ArrowRight,
  UserCheck,
  Calendar,
  Megaphone,
  CheckCircle2,
  Clock,
  Activity,
  Heart,
  ChevronRight,
  Shield,
  ThumbsUp,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/lib/admin-dashboard/queries";
import { PriorityBadge } from "@/components/priority-badge";
import { EmptyState } from "@/components/empty-state";
import { formatComplaintDate } from "@/lib/complaints/constants";
import { formatDateTime } from "@/lib/facilities/constants";
import { cn } from "@/lib/utils";


// Import Recharts wrappers (client components)
import {
  ResidentGrowthChart,
  BookingApprovalChart,
  ComplaintDistributionChart,
} from "@/components/admin-dashboard/dashboard-charts";

export const dynamic = "force-dynamic";

// Relative time calculation utility
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();

  if (!profile.society_id) {
    redirect("/onboarding");
  }

  const data = await getAdminDashboardData(profile.society_id);
  const { stats, pendingActions, recentActivities, insights } = data;

  // Header Greeting by Hour
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17) {
    greeting = "Good evening";
  }

  // Admin First Name Resolving
  const adminFirstName = profile.full_name
    ? profile.full_name.trim().split(" ")[0]
    : "Administrator";

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate Community Health Score
  const totalComplaints = stats.complaints.open + stats.complaints.inProgress + stats.complaints.resolved;
  const complaintRate = totalComplaints > 0 ? stats.complaints.resolved / totalComplaints : 1.0;

  const approvedBookings = insights.bookingsStatusRate.find((b) => b.status === "approved")?.count || 0;
  const totalBookings = insights.bookingsStatusRate.reduce((sum, b) => sum + b.count, 0);
  const bookingRate = totalBookings > 0 ? approvedBookings / totalBookings : 1.0;

  const residentRate = stats.residents.total > 0 ? stats.residents.approved / stats.residents.total : 1.0;

  const healthScore = Math.round((complaintRate * 0.4 + bookingRate * 0.3 + residentRate * 0.3) * 100);

  let healthLabel = "Excellent";
  let healthColorClass = "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (healthScore < 60) {
    healthLabel = "Needs Attention";
    healthColorClass = "text-error bg-error/10 border-error/20";
  } else if (healthScore < 80) {
    healthLabel = "Good";
    healthColorClass = "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
  }

  // Today's summary calculations using existing metrics
  const todayStr = new Date().toDateString();
  const newComplaintsToday = recentActivities.filter(
    (a) => a.type === "complaint_created" && new Date(a.timestamp).toDateString() === todayStr
  ).length;

  const newNoticesToday = recentActivities.filter(
    (a) => a.type === "notice_published" && new Date(a.timestamp).toDateString() === todayStr
  ).length;

  const pendingBookingsCount = stats.facilities.pendingApprovals;
  const pendingResidentsCount = stats.residents.pending;

  // Timeline Activity Grouping (Max 8 records)
  const nowTime = new Date();
  const todayStart = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const activityLimit = recentActivities.slice(0, 8);
  const groupedActivities = {
    today: activityLimit.filter((a) => new Date(a.timestamp).getTime() >= todayStart),
    yesterday: activityLimit.filter(
      (a) => {
        const t = new Date(a.timestamp).getTime();
        return t >= yesterdayStart && t < todayStart;
      }
    ),
    earlier: activityLimit.filter((a) => new Date(a.timestamp).getTime() < yesterdayStart),
  };

  return (
    <div className="space-y-xl max-w-container-max mx-auto px-margin-mobile sm:px-md py-md">
      {/* ── SECTION 1 — EDITORIAL WELCOME MASTHEAD ───────────────── */}
      <div className="border-b-2 border-[#111111] pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#737373] mb-1">
          Administration Dashboard
        </p>
        <hr className="border-t-2 border-[#111111] mb-3" />
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-sm">
          <div>
            <h1 className="font-serif text-[28px] md:text-[36px] font-bold text-[#111111] tracking-tight leading-none">
              {greeting}, {adminFirstName}
            </h1>
            <p className="text-body-sm text-[#525252] mt-1">
              Manage residents, complaints, facilities, notices, and community operations.
            </p>
          </div>
          <div className="md:text-right flex flex-col md:items-end justify-center shrink-0">
            <p className="font-mono text-[11px] text-[#525252]">{currentDateStr}</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant border border-outline-variant px-2 py-0.5 mt-1 inline-block">
              {data.societyName && !data.societyName.toLowerCase().includes("demo")
                ? data.societyName
                : "CommUnity Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* ── DAILY BRIEF STRIP ────────────────────────────── */}
      <div className="border border-[#111111] bg-surface px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 shrink-0 border-b sm:border-b-0 border-outline-variant pb-2 sm:pb-0">
          <span className="flex size-2 bg-[#CC0000]" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface">
            DAILY BRIEF
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <strong className={`font-mono text-sm ${newComplaintsToday > 0 ? "text-accent" : "text-on-surface"}`}>{newComplaintsToday}</strong>
            <span className="text-[11px] uppercase tracking-wider">New Complaints</span>
          </span>
          <span className="text-outline-variant select-none">|</span>
          <span className="flex items-center gap-1.5">
            <strong className={`font-mono text-sm ${pendingBookingsCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-on-surface"}`}>{pendingBookingsCount}</strong>
            <span className="text-[11px] uppercase tracking-wider">Pending Bookings</span>
          </span>
          <span className="text-outline-variant select-none">|</span>
          <span className="flex items-center gap-1.5">
            <strong className="font-mono text-sm text-on-surface">{newNoticesToday}</strong>
            <span className="text-[11px] uppercase tracking-wider">Notices Today</span>
          </span>
          <span className="text-outline-variant select-none">|</span>
          <span className="flex items-center gap-1.5">
            <strong className={`font-mono text-sm ${pendingResidentsCount > 0 ? "text-accent" : "text-on-surface"}`}>{pendingResidentsCount}</strong>
            <span className="text-[11px] uppercase tracking-wider">Pending Approvals</span>
          </span>
        </div>
      </div>


      {/* ── SECTION 2 — EXECUTIVE KPI GRID ─────────────────────── */}
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Residents */}
        <div className="border border-[#E5E5E0] bg-white p-md flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#737373]">Residents</span>
            <span className="text-[#525252]">
              <Users className="size-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[36px] font-bold text-[#111111] tracking-tight leading-none">
              {stats.residents.approved}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#737373]">
              <span>+{stats.activity.newResidentsThisMonth} Joiners</span>
              <span>·</span>
              <span className={stats.residents.pending > 0 ? "text-[#CC0000] font-semibold" : ""}>
                {stats.residents.pending} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Complaints */}
        <div className="border border-[#E5E5E0] bg-white p-md flex flex-col justify-between min-h-[145px] border-l-4 border-l-[#CC0000]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#737373]">Complaints</span>
            <span className="text-[#CC0000]">
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[36px] font-bold text-[#111111] tracking-tight leading-none">
              {stats.complaints.open + stats.complaints.inProgress}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#737373]">
              <span>{stats.complaints.resolved} Resolved</span>
              <span>·</span>
              <span>{stats.complaints.open} Open</span>
            </div>
          </div>
        </div>

        {/* Card 3: Facilities */}
        <div className="border border-[#E5E5E0] bg-white p-md flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#737373]">Facilities</span>
            <span className="text-[#525252]">
              <Building className="size-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[36px] font-bold text-[#111111] tracking-tight leading-none">
              {stats.facilities.active}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#737373]">
              <span>{stats.facilities.upcomingBookings} Upcoming</span>
              <span>·</span>
              <span className={stats.facilities.pendingApprovals > 0 ? "text-[#D97706] font-semibold" : ""}>
                {stats.facilities.pendingApprovals} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Community Activity */}
        <div className="border border-[#E5E5E0] bg-white p-md flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#737373]">Alerts Board</span>
            <span className="text-[#525252]">
              <Megaphone className="size-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[36px] font-bold text-[#111111] tracking-tight leading-none">
              {stats.activity.noticesThisMonth}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-[#737373]">
              <span>{stats.activity.notificationsSent} Notifications</span>
              <span>·</span>
              <span>This Month</span>
            </div>
          </div>
        </div>

        {/* Card 5: Community Health */}
        <div className="border border-[#E5E5E0] bg-white p-md flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#737373]">Health Score</span>
            <span className="text-[#525252]">
              <Heart className="size-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[36px] font-bold text-[#111111] tracking-tight leading-none flex items-baseline gap-0.5">
              {healthScore}
              <span className="text-body-sm font-bold text-[#737373]">%</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cn("font-mono text-[10px] font-extrabold px-1.5 py-0.5 border leading-none", healthColorClass)}>
                {healthLabel}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* ── SECTION 3 — QUICK ACTIONS (SINGLE ROW COMMAND PANELS) ── */}
      <section className="space-y-md">
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
          Quick Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-md">
          <Link
            href="/admin/residents"
            className="group border border-[#E5E5E0] bg-white p-md flex flex-col justify-between gap-sm hover:border-[#111111] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#525252] group-hover:text-[#111111]">
                <Users className="size-4" />
              </span>
              <ChevronRight className="size-3.5 text-[#A3A3A3] group-hover:text-[#111111] transition-colors" />
            </div>
            <div className="mt-1">
              <h3 className="text-body-sm font-bold text-[#111111]">Residents</h3>
              <p className="text-[11px] font-medium text-[#737373] mt-0.5">Approve &amp; update profiles</p>
            </div>
          </Link>

          <Link
            href="/admin/complaints"
            className="group border border-[#E5E5E0] bg-white p-md flex flex-col justify-between gap-sm hover:border-[#CC0000] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#CC0000]">
                <AlertTriangle className="size-4" />
              </span>
              <ChevronRight className="size-3.5 text-[#A3A3A3] group-hover:text-[#CC0000] transition-colors" />
            </div>
            <div className="mt-1">
              <h3 className="text-body-sm font-bold text-[#111111]">Complaints</h3>
              <p className="text-[11px] font-medium text-[#737373] mt-0.5">Review &amp; resolve issues</p>
            </div>
          </Link>

          <Link
            href="/admin/notices"
            className="group border border-[#E5E5E0] bg-white p-md flex flex-col justify-between gap-sm hover:border-[#111111] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#525252] group-hover:text-[#111111]">
                <Megaphone className="size-4" />
              </span>
              <ChevronRight className="size-3.5 text-[#A3A3A3] group-hover:text-[#111111] transition-colors" />
            </div>
            <div className="mt-1">
              <h3 className="text-body-sm font-bold text-[#111111]">Notices</h3>
              <p className="text-[11px] font-medium text-[#737373] mt-0.5">Publish bulletins &amp; alerts</p>
            </div>
          </Link>

          <Link
            href="/admin/facilities"
            className="group border border-[#E5E5E0] bg-white p-md flex flex-col justify-between gap-sm hover:border-[#111111] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#525252] group-hover:text-[#111111]">
                <Building className="size-4" />
              </span>
              <ChevronRight className="size-3.5 text-[#A3A3A3] group-hover:text-[#111111] transition-colors" />
            </div>
            <div className="mt-1">
              <h3 className="text-body-sm font-bold text-[#111111]">Facilities</h3>
              <p className="text-[11px] font-medium text-[#737373] mt-0.5">Configure shared amenities</p>
            </div>
          </Link>

          <Link
            href="/admin/bookings"
            className="group border border-[#E5E5E0] bg-white p-md flex flex-col justify-between gap-sm hover:border-[#111111] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#525252] group-hover:text-[#111111]">
                <Calendar className="size-4" />
              </span>
              <ChevronRight className="size-3.5 text-[#A3A3A3] group-hover:text-[#111111] transition-colors" />
            </div>
            <div className="mt-1">
              <h3 className="text-body-sm font-bold text-[#111111]">Bookings</h3>
              <p className="text-[11px] font-medium text-[#737373] mt-0.5">Manage amenity reservations</p>
            </div>
          </Link>
        </div>
      </section>


      {/* ── SECTION 4 — MAIN WORKSPACE: 70 / 30 SPLIT ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-gutter items-start">
        {/* LEFT (70%): Redesigned activity timeline feed */}
        <div className="lg:col-span-7 space-y-md">
          <h2 className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Recent Activity Feed
          </h2>

          {recentActivities.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg text-center shadow-sm">
              <EmptyState
                icon={Activity}
                title="No recent activities"
                description="Community operations and resident bookings will show up here automatically."
                className="py-xl border-none bg-transparent"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md md:p-lg space-y-lg shadow-sm">
              {/* Group: TODAY */}
              {groupedActivities.today.length > 0 && (
                <div className="space-y-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded w-fit select-none">
                    Today
                  </div>
                  <div className="divide-y divide-outline-variant/40 pl-1">
                    {groupedActivities.today.map((act) => (
                      <ActivityTimelineItem key={act.id} item={act} />
                    ))}
                  </div>
                </div>
              )}

              {/* Group: YESTERDAY */}
              {groupedActivities.yesterday.length > 0 && (
                <div className="space-y-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded w-fit select-none">
                    Yesterday
                  </div>
                  <div className="divide-y divide-outline-variant/40 pl-1">
                    {groupedActivities.yesterday.map((act) => (
                      <ActivityTimelineItem key={act.id} item={act} />
                    ))}
                  </div>
                </div>
              )}

              {/* Group: EARLIER */}
              {groupedActivities.earlier.length > 0 && (
                <div className="space-y-sm">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded w-fit select-none">
                    Earlier
                  </div>
                  <div className="divide-y divide-outline-variant/40 pl-1">
                    {groupedActivities.earlier.map((act) => (
                      <ActivityTimelineItem key={act.id} item={act} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT (30%): Sticky pending panels queues */}
        <div className="lg:col-span-3 lg:sticky lg:top-4 space-y-lg">
          <h2 className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Pending Association Tasks
          </h2>

          {/* Pending Registrations queue */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md space-y-md shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-xs">
              <span className="text-body-sm font-bold text-on-surface flex items-center gap-2">
                <UserCheck className="size-4 text-primary" /> Registrations
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                {pendingActions.pendingResidents.length}
              </span>
            </div>
            {pendingActions.pendingResidents.length === 0 ? (
              <div className="py-2 text-center">
                <ThumbsUp className="size-7 text-emerald-600 dark:text-emerald-400 mx-auto opacity-70" />
                <h4 className="text-body-sm font-bold text-on-surface mt-2">All residents are approved</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">There are no pending registrations.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/40 space-y-sm">
                {pendingActions.pendingResidents.map((resident) => (
                  <div key={resident.id} className="pt-sm first:pt-0 flex items-center justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold text-on-surface truncate">
                        {resident.full_name || "Resident"}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        Unit: {resident.unit_label || "N/A"} • Registered {new Date(resident.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/residents/${resident.id}`}
                      className="rounded border border-outline-variant hover:border-primary hover:text-primary px-2.5 py-1 text-[11px] font-bold text-on-surface transition-colors shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Bookings queue */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md space-y-md shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-xs">
              <span className="text-body-sm font-bold text-on-surface flex items-center gap-2">
                <Calendar className="size-4 text-violet-600 dark:text-violet-400" /> Bookings
              </span>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-extrabold text-violet-600 dark:text-violet-400">
                {pendingActions.pendingBookings.length}
              </span>
            </div>
            {pendingActions.pendingBookings.length === 0 ? (
              <div className="py-2 text-center">
                <CheckCircle2 className="size-7 text-emerald-600 dark:text-emerald-400 mx-auto opacity-70" />
                <h4 className="text-body-sm font-bold text-on-surface mt-2">Everything looks good</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">No booking approvals are waiting for review.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/40 space-y-sm">
                {pendingActions.pendingBookings.map((booking) => (
                  <div key={booking.id} className="pt-sm first:pt-0 flex items-center justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold text-on-surface truncate">
                        {booking.facility?.name || "Facility"}
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        By {booking.resident?.full_name || "Unknown"} • {formatDateTime(booking.start_time).split(",")[0]}
                      </p>
                    </div>
                    <Link
                      href="/admin/bookings"
                      className="rounded border border-outline-variant hover:border-primary hover:text-primary px-2.5 py-1 text-[11px] font-bold text-on-surface transition-colors shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Priority Complaints queue */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md space-y-md shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-xs">
              <span className="text-body-sm font-bold text-on-surface flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" /> High-Priority Issues
              </span>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 dark:text-amber-400">
                {pendingActions.highPriorityComplaints.length}
              </span>
            </div>
            {pendingActions.highPriorityComplaints.length === 0 ? (
              <div className="py-2 text-center">
                <Shield className="size-7 text-emerald-600 dark:text-emerald-400 mx-auto opacity-70" />
                <h4 className="text-body-sm font-bold text-on-surface mt-2">No high priority issues</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Everything is quiet.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/40 space-y-sm">
                {pendingActions.highPriorityComplaints.map((complaint) => (
                  <div key={complaint.id} className="pt-sm first:pt-0 flex items-center justify-between gap-sm">
                    <div className="min-w-0">
                      <p className="text-body-sm font-bold text-on-surface truncate">
                        {complaint.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <PriorityBadge priority={complaint.priority} className="scale-[0.8] origin-left" />
                        <span className="text-[10px] text-on-surface-variant font-semibold">
                          Raised {formatComplaintDate(complaint.created_at)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/admin/complaints/${complaint.id}`}
                      className="rounded border border-outline-variant hover:border-primary hover:text-primary px-2.5 py-1 text-[11px] font-bold text-on-surface transition-colors shrink-0"
                    >
                      Inspect
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 5 — ANALYTICS AREA (THREE COLUMN GRID) ───────── */}
      <section className="space-y-md">
        <h2 className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
          System Analytics &amp; Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Chart 1: Resident Growth */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md flex flex-col justify-between min-h-[290px] shadow-sm">
            <div>
              <h4 className="text-body-md font-bold text-on-surface">Resident Onboarding</h4>
              <p className="text-body-sm text-on-surface-variant">Registration wave index over the last 6 months</p>
            </div>
            <div className="h-[180px] mt-md">
              <ResidentGrowthChart data={insights.registrationsByMonth} />
            </div>
          </div>

          {/* Chart 2: Booking Approval Rate */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md flex flex-col justify-between min-h-[290px] shadow-sm">
            <div>
              <h4 className="text-body-md font-bold text-on-surface">Booking Approval Rate</h4>
              <p className="text-body-sm text-on-surface-variant">Breakdown of facility bookings approvals</p>
            </div>
            <div className="h-[180px] mt-md flex items-center justify-center">
              <BookingApprovalChart statusRate={insights.bookingsStatusRate} />
            </div>
          </div>

          {/* Chart 3: Complaint Category Distribution */}
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-md flex flex-col justify-between min-h-[290px] shadow-sm">
            <div>
              <h4 className="text-body-md font-bold text-on-surface">Complaint Distribution</h4>
              <p className="text-body-sm text-on-surface-variant">Volume categorized by complaint type</p>
            </div>
            <div className="mt-md flex-1 flex flex-col justify-center">
              <ComplaintDistributionChart categories={insights.complaintsByCategory} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ActivityItem {
  id: string;
  type: "resident_registered" | "complaint_created" | "complaint_resolved" | "booking_approved" | "notice_published";
  timestamp: string;
  title: string;
  description: string;
  linkUrl: string;
}

// Activity feed single line visual renderer
function ActivityTimelineItem({ item }: { item: ActivityItem }) {
  let badgeColor = "text-primary bg-primary/10";
  let Icon = UserCheck;

  if (item.type === "complaint_created") {
    badgeColor = "text-amber-700 dark:text-amber-400 bg-amber-500/10";
    Icon = AlertTriangle;
  } else if (item.type === "complaint_resolved") {
    badgeColor = "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10";
    Icon = CheckCircle2;
  } else if (item.type === "booking_approved") {
    badgeColor = "text-violet-600 dark:text-violet-400 bg-violet-500/10";
    Icon = Calendar;
  } else if (item.type === "notice_published") {
    badgeColor = "text-secondary bg-secondary/10";
    Icon = Megaphone;
  }

  return (
    <div className="py-3 flex items-start gap-4 group">
      <div className={`p-2 rounded-xl shrink-0 ${badgeColor}`}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-sm">
          <p className="text-body-sm font-bold text-on-surface">{item.title}</p>
          <span className="text-[11px] text-outline font-bold shrink-0 flex items-center gap-1">
            <Clock className="size-3" />
            {getRelativeTime(item.timestamp)}
          </span>
        </div>
        <p className="text-body-sm text-on-surface-variant mt-0.5 leading-relaxed truncate">
          {item.description}
        </p>
        <Link
          href={item.linkUrl}
          className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary hover:underline mt-1.5"
        >
          Inspect <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
