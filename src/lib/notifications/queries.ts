import { createClient } from "@/lib/supabase/server";

export type NotificationType = "account" | "booking" | "complaint" | "notice" | "community";

export type NotificationFilters = {
  status?: "all" | "unread" | "read";
  type?: "all" | NotificationType;
  search?: string;
};

export async function getNotifications(
  userId: string,
  filters: NotificationFilters = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status === "unread") {
    query = query.eq("is_read", false);
  } else if (filters.status === "read") {
    query = query.eq("is_read", true);
  }

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  if (filters.search?.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},message.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
