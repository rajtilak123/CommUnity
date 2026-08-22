import type {
  NoticeListItem,
  NoticeStats,
  NoticeStatus,
  NoticeWithRelations,
} from "@/types/notices";
import { createClient } from "@/lib/supabase/server";

type ResidentNoticeFilters = {
  search?: string;
  category?: string | "all";
};

type AdminNoticeFilters = {
  search?: string;
  status?: NoticeStatus | "all";
};

export async function getResidentNotices(
  userId: string,
  societyId: string,
  filters: ResidentNoticeFilters = {}
): Promise<NoticeListItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("notices")
    .select(`
      *,
      attachments:notice_attachments(*),
      reads:notice_reads(profile_id),
      author:profiles!created_by(id, full_name, unit_label, avatar_url)
    `)
    .eq("society_id", societyId)
    .eq("status", "published")
    .lte("published_at", now)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},content.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const notices = data ?? [];

  return (notices as { reads?: { profile_id: string }[] }[]).map((notice) => ({
    ...notice,
    is_read: notice.reads ? notice.reads.some((r) => r.profile_id === userId) : false,
  })) as unknown as NoticeListItem[];
}

export async function getUnreadNoticesCount(userId: string, societyId: string): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: readData, error: readError } = await supabase
    .from("notice_reads")
    .select("notice_id")
    .eq("profile_id", userId);

  if (readError) {
    throw new Error(readError.message);
  }

  const readNoticeIds = (readData ?? []).map((r) => r.notice_id);

  let query = supabase
    .from("notices")
    .select("id", { count: "exact", head: true })
    .eq("society_id", societyId)
    .eq("status", "published")
    .lte("published_at", now)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (readNoticeIds.length > 0) {
    query = query.not("id", "in", `(${readNoticeIds.join(",")})`);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getNoticeById(
  noticeId: string,
  userId?: string
): Promise<NoticeWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select(`
      *,
      attachments:notice_attachments(*),
      reads:notice_reads(*),
      author:profiles!created_by(id, full_name, email, unit_label, avatar_url, role)
    `)
    .eq("id", noticeId)
    .single();

  if (error || !data) {
    return null;
  }

  const notice = data as NoticeWithRelations;
  if (userId) {
    notice.is_read = notice.reads ? notice.reads.some((r) => r.profile_id === userId) : false;
  }

  return notice;
}

export async function getAdminNotices(
  societyId: string,
  filters: AdminNoticeFilters = {}
): Promise<NoticeListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("notices")
    .select(`
      *,
      attachments:notice_attachments(*),
      author:profiles!created_by(id, full_name, unit_label, avatar_url)
    `)
    .eq("society_id", societyId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},content.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NoticeListItem[];
}

export async function getAdminNoticeStats(societyId: string): Promise<NoticeStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select("status")
    .eq("society_id", societyId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];

  return {
    published: rows.filter((r) => r.status === "published").length,
    drafts: rows.filter((r) => r.status === "draft").length,
    archived: rows.filter((r) => r.status === "archived").length,
    unread: 0, // Not applicable for admin globally
  };
}
