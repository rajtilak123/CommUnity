import type {
  ComplaintListItem,
  ComplaintStats,
  ComplaintWithRelations,
} from "@/types/complaints";
import type { ComplaintPriority, ComplaintStatus } from "@/types/ui";
import { createClient } from "@/lib/supabase/server";

type ResidentComplaintFilters = {
  search?: string;
  status?: ComplaintStatus | "all";
};

type AdminComplaintFilters = {
  search?: string;
  status?: ComplaintStatus | "all";
  priority?: ComplaintPriority | "all";
  category?: string | "all";
};

export async function getResidentComplaints(
  userId: string,
  filters: ResidentComplaintFilters = {},
): Promise<ComplaintListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("complaints")
    .select("*, attachments:complaint_attachments(*)")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},reference_code.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ComplaintListItem[];
}

export async function getResidentComplaintStats(userId: string): Promise<ComplaintStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("complaints")
    .select("status, priority")
    .eq("created_by", userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  return {
    open: rows.filter((r) => r.status === "open").length,
    in_progress: rows.filter((r) => r.status === "in_progress").length,
    resolved: rows.filter((r) => r.status === "resolved").length,
    high_priority: rows.filter((r) => r.priority === "high" || r.priority === "urgent").length,
  };
}

export async function getComplaintById(
  complaintId: string,
  options: { includeInternalComments?: boolean } = {},
): Promise<ComplaintWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(
      `
      *,
      attachments:complaint_attachments(*),
      comments:complaint_comments(
        *,
        author:profiles(id, full_name, role)
      ),
      status_history:complaint_status_history(*),
      author:profiles!created_by(id, full_name, email, phone, unit_label, avatar_url),
      assignee:profiles!assigned_to(id, full_name)
    `,
    )
    .eq("id", complaintId)
    .single();

  if (error || !data) {
    return null;
  }

  const complaint = data as ComplaintWithRelations;

  if (!options.includeInternalComments) {
    complaint.comments = complaint.comments.filter((comment) => !comment.is_internal);
  }

  complaint.comments.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  complaint.status_history.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return complaint;
}

export async function getAdminComplaints(
  societyId: string,
  filters: AdminComplaintFilters = {},
): Promise<ComplaintListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("complaints")
    .select(
      `
      *,
      attachments:complaint_attachments(*),
      author:profiles!created_by(id, full_name, unit_label)
    `,
    )
    .eq("society_id", societyId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},reference_code.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ComplaintListItem[];
}
