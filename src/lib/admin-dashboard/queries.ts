import { createClient } from "@/lib/supabase/server";
import type { ComplaintListItem } from "@/types/complaints";
import type { BookingListItem } from "@/types/facilities";
import type { Profile } from "@/types/auth";

export type AdminDashboardData = {
  societyName: string;
  stats: {
    residents: {
      total: number;
      approved: number;
      pending: number;
    };
    complaints: {
      open: number;
      inProgress: number;
      resolved: number;
    };
    facilities: {
      active: number;
      upcomingBookings: number;
      pendingApprovals: number;
    };
    activity: {
      noticesThisMonth: number;
      notificationsSent: number;
      newResidentsThisMonth: number;
    };
  };
  pendingActions: {
    pendingResidents: Profile[];
    pendingBookings: BookingListItem[];
    highPriorityComplaints: ComplaintListItem[];
  };
  recentActivities: {
    id: string;
    type: "resident_registered" | "complaint_created" | "complaint_resolved" | "booking_approved" | "notice_published";
    timestamp: string;
    title: string;
    description: string;
    linkUrl: string;
  }[];
  insights: {
    complaintsByCategory: { category: string; count: number }[];
    bookingsByFacility: { name: string; count: number }[];
    bookingsStatusRate: { status: string; count: number }[];
    registrationsByMonth: { month: string; count: number }[];
  };
};

export async function getAdminDashboardData(
  societyId: string,
): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Parallel database calls
  const [
    societyResult,
    profilesResult,
    complaintsResult,
    noticesResult,
    bookingsResult,
    facilitiesResult,
    notificationsCountResult,
  ] = await Promise.all([
    // 1. Get Society Name
    supabase
      .from("societies")
      .select("name")
      .eq("id", societyId)
      .single(),

    // 2. Fetch Profiles for the Society
    supabase
      .from("profiles")
      .select("*")
      .eq("society_id", societyId),

    // 3. Fetch Complaints for the Society
    supabase
      .from("complaints")
      .select(`
        *,
        author:profiles!created_by(id, full_name, unit_label)
      `)
      .eq("society_id", societyId),

    // 4. Fetch Notices for the Society
    supabase
      .from("notices")
      .select("id, title, status, category, priority, published_at, created_at")
      .eq("society_id", societyId),

    // 5. Fetch Bookings for the Society
    supabase
      .from("facility_bookings")
      .select(`
        *,
        facility:facilities(id, name),
        resident:profiles!profile_id(id, full_name, unit_label)
      `)
      .eq("society_id", societyId),

    // 6. Fetch Facilities for the Society
    supabase
      .from("facilities")
      .select("id, name, is_active")
      .eq("society_id", societyId),

    // 7. Count notifications sent to users in this society
    supabase
      .from("notifications")
      .select("id, profile:profiles!user_id!inner(society_id)", { count: "exact", head: true })
      .eq("profile.society_id", societyId),
  ]);

  // Handle Society Name
  const societyName = societyResult.data?.name || "CommUnity";

  // 1. Residents stats
  const allProfiles = (profilesResult.data ?? []) as Profile[];
  const residents = allProfiles.filter((p) => p.role === "resident");
  const residentsTotal = residents.length;
  const residentsApproved = residents.filter((p) => p.status === "approved").length;
  const residentsPending = residents.filter((p) => p.status === "pending").length;

  // 2. Complaints stats
  const complaints = (complaintsResult.data ?? []) as (ComplaintListItem & { author: { id: string; full_name: string; unit_label: string } })[];
  const complaintsOpen = complaints.filter((c) => c.status === "open").length;
  const complaintsInProgress = complaints.filter((c) => c.status === "in_progress").length;
  const complaintsResolved = complaints.filter((c) => c.status === "resolved" || c.status === "closed").length;

  // 3. Facilities & Bookings stats
  const facilities = facilitiesResult.data ?? [];
  const activeFacilities = facilities.filter((f) => f.is_active).length;

  const bookings = (bookingsResult.data ?? []) as BookingListItem[];
  const upcomingBookings = bookings.filter(
    (b) => b.status === "approved" && b.start_time >= now,
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  // 4. Community Activity
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthTime = startOfMonth.getTime();

  const notices = noticesResult.data ?? [];
  const noticesThisMonth = notices.filter((n) => {
    if (n.status !== "published" || !n.published_at) return false;
    return new Date(n.published_at).getTime() >= startOfMonthTime;
  }).length;

  const notificationsSent = notificationsCountResult.count ?? 0;

  const newResidentsThisMonth = residents.filter((p) => {
    return new Date(p.created_at).getTime() >= startOfMonthTime;
  }).length;

  // Pending Actions
  const pendingResidentsList = residents
    .filter((p) => p.status === "pending")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const pendingBookingsList = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 5);

  const highPriorityComplaints = complaints
    .filter(
      (c) =>
        (c.status === "open" || c.status === "in_progress") &&
        (c.priority === "high" || c.priority === "urgent"),
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) as unknown as ComplaintListItem[];

  // Recent Activity Feed (up to 10 activities)
  const activities: AdminDashboardData["recentActivities"] = [];

  // Register activities
  residents.forEach((r) => {
    activities.push({
      id: `res-${r.id}`,
      type: "resident_registered",
      timestamp: r.created_at,
      title: "New Resident Registered",
      description: `${r.full_name || "A new resident"} registered in Unit ${r.unit_label || "N/A"}`,
      linkUrl: `/admin/residents/${r.id}`,
    });
  });

  // Complaint created activities
  complaints.forEach((c) => {
    activities.push({
      id: `comp-create-${c.id}`,
      type: "complaint_created",
      timestamp: c.created_at,
      title: "Complaint Created",
      description: `"${c.title}" raised by ${c.author?.full_name || "Resident"}`,
      linkUrl: `/admin/complaints/${c.id}`,
    });

    if (c.status === "resolved" || c.status === "closed") {
      activities.push({
        id: `comp-resolve-${c.id}`,
        type: "complaint_resolved",
        timestamp: c.updated_at || c.created_at,
        title: "Complaint Resolved",
        description: `"${c.title}" marked as resolved`,
        linkUrl: `/admin/complaints/${c.id}`,
      });
    }
  });

  // Booking approved activities
  bookings.forEach((b) => {
    if (b.status === "approved") {
      activities.push({
        id: `book-app-${b.id}`,
        type: "booking_approved",
        timestamp: b.updated_at || b.created_at,
        title: "Booking Approved",
        description: `Reservation for ${b.facility?.name || "facility"} approved for ${b.resident?.full_name || "Resident"}`,
        linkUrl: `/admin/bookings`,
      });
    }
  });

  // Notice published activities
  notices.forEach((n) => {
    if (n.status === "published" && n.published_at) {
      activities.push({
        id: `notice-pub-${n.id}`,
        type: "notice_published",
        timestamp: n.published_at,
        title: "Notice Published",
        description: `"${n.title}" published to notice board`,
        linkUrl: `/admin/notices/${n.id}`,
      });
    }
  });

  // Sort all activities by timestamp desc and take top 10
  const recentActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Insights Calculations
  // 1. Complaints by Category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const cat = c.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const complaintsByCategory = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // 2. Bookings by Facility
  const facilityCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    const name = b.facility?.name || "Facility";
    facilityCounts[name] = (facilityCounts[name] || 0) + 1;
  });
  const bookingsByFacility = Object.entries(facilityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 3. Bookings Status Rate
  const statusCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    const status = b.status || "pending";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const bookingsStatusRate = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // 4. Registrations by Month (Last 6 months)
  const registrationsByMonth: { month: string; count: number }[] = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const nowTemp = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(nowTemp.getFullYear(), nowTemp.getMonth() - i, 1);
    const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    
    const count = residents.filter((r) => {
      const rDate = new Date(r.created_at);
      return (
        rDate.getFullYear() === d.getFullYear() &&
        rDate.getMonth() === d.getMonth()
      );
    }).length;

    registrationsByMonth.push({ month: monthLabel, count });
  }

  return {
    societyName,
    stats: {
      residents: {
        total: residentsTotal,
        approved: residentsApproved,
        pending: residentsPending,
      },
      complaints: {
        open: complaintsOpen,
        inProgress: complaintsInProgress,
        resolved: complaintsResolved,
      },
      facilities: {
        active: activeFacilities,
        upcomingBookings: upcomingBookings,
        pendingApprovals: pendingBookings,
      },
      activity: {
        noticesThisMonth,
        notificationsSent,
        newResidentsThisMonth,
      },
    },
    pendingActions: {
      pendingResidents: pendingResidentsList,
      pendingBookings: pendingBookingsList,
      highPriorityComplaints,
    },
    recentActivities,
    insights: {
      complaintsByCategory,
      bookingsByFacility,
      bookingsStatusRate,
      registrationsByMonth,
    },
  };
}
