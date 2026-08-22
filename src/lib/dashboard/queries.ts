import { createClient } from "@/lib/supabase/server";
import { getSocietyById } from "@/lib/residents/queries";
import { getResidentComplaints } from "@/lib/complaints/queries";
import { getResidentNotices } from "@/lib/notices/queries";
import { getResidentBookings, getResidentFacilities } from "@/lib/facilities/queries";
import type { ComplaintListItem } from "@/types/complaints";
import type { NoticeListItem } from "@/types/notices";
import type { BookingListItem, Facility, FacilityImage } from "@/types/facilities";

export type DashboardBookingListItem = BookingListItem & {
  facility?: Pick<Facility, "id" | "name"> & {
    images?: FacilityImage[];
  };
};

export type ResidentDashboardData = {
  societyName: string;
  stats: {
    complaintsOpen: number;
    latestComplaintUpdate: string | null;
    unreadNotices: number;
    latestUnreadNoticeTitle: string | null;
    upcomingBookings: number;
    nearestBookingDate: string | null;
    activeFacilities: number;
    noticesThisMonth: number;
    approvedResidents: number;
  };
  latestNotices: NoticeListItem[];
  latestComplaints: ComplaintListItem[];
  upcomingBookingsList: DashboardBookingListItem[];
};

export async function getResidentDashboardData(
  userId: string,
  societyId: string,
): Promise<ResidentDashboardData> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Orchestrated parallel calls reusing existing queries plus approved residents count
  const [
    society,
    complaints,
    notices,
    bookings,
    facilities,
    residentsCountResult,
  ] = await Promise.all([
    getSocietyById(societyId),
    getResidentComplaints(userId),
    getResidentNotices(userId, societyId),
    getResidentBookings(userId),
    getResidentFacilities(societyId),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("society_id", societyId)
      .eq("role", "resident")
      .eq("status", "approved"),
  ]);

  const societyName = society?.name || "CommUnity Society";

  // Complaints stats
  const complaintsOpen = complaints.filter(
    (c) => c.status === "open" || c.status === "in_progress",
  ).length;

  let latestComplaintUpdate: string | null = null;
  if (complaints.length > 0) {
    const dates = complaints
      .map((c) => new Date(c.updated_at || c.created_at).getTime())
      .filter((t) => !isNaN(t));
    if (dates.length > 0) {
      latestComplaintUpdate = new Date(Math.max(...dates)).toISOString();
    }
  }

  const latestComplaints = complaints.slice(0, 5);

  // Notices stats
  const unreadNotices = notices.filter((n) => !n.is_read).length;
  const firstUnread = notices.find((n) => !n.is_read);
  const latestUnreadNoticeTitle = firstUnread ? firstUnread.title : null;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthTime = startOfMonth.getTime();

  let noticesThisMonth = 0;
  for (const notice of notices) {
    const publishedTime = new Date(notice.published_at || "").getTime();
    if (!isNaN(publishedTime) && publishedTime >= startOfMonthTime) {
      noticesThisMonth++;
    }
  }

  const latestNotices = notices.slice(0, 5);

  // Future approved bookings stats
  const upcomingBookingsRaw = bookings
    .filter((b) => b.status === "approved" && b.start_time >= now)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const upcomingBookings = upcomingBookingsRaw.length;
  const nearestBookingDate = upcomingBookings > 0 ? upcomingBookingsRaw[0].start_time : null;

  // Reconstruct facility details including images in memory (joining tables in-memory)
  const upcomingBookingsList = upcomingBookingsRaw.slice(0, 5).map((booking) => {
    const facilityDetails = facilities.find((f) => f.id === booking.facility_id);
    return {
      ...booking,
      facility: {
        id: booking.facility?.id || booking.facility_id,
        name: booking.facility?.name || facilityDetails?.name || "Facility",
        images: facilityDetails?.images || [],
      },
    } as DashboardBookingListItem;
  });

  const activeFacilities = facilities.length;
  const approvedResidents = residentsCountResult.count ?? 0;

  return {
    societyName,
    stats: {
      complaintsOpen,
      latestComplaintUpdate,
      unreadNotices,
      latestUnreadNoticeTitle,
      upcomingBookings,
      nearestBookingDate,
      activeFacilities,
      noticesThisMonth,
      approvedResidents,
    },
    latestNotices,
    latestComplaints,
    upcomingBookingsList,
  };
}

