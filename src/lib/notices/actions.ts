"use server";

import { revalidatePath } from "next/cache";

import { createNoticeSchema, updateNoticeSchema } from "@/lib/validations/notices";
import { requireAdmin, requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type NoticeActionState = {
  error?: string;
  success?: string;
  id?: string;
  warning?: string;
};

export async function createNoticeAction(
  _prevState: NoticeActionState,
  formData: FormData
): Promise<NoticeActionState> {
  const profile = await requireAdmin();
  
  const parsed = createNoticeSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    is_pinned: formData.get("is_pinned") === "true",
    published_at: formData.get("published_at") || null,
    expires_at: formData.get("expires_at") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const societyId = profile.society_id;
  if (!societyId) {
    return { error: "No society configured for user profile" };
  }

  const publishedAt = parsed.data.status === "published"
    ? (parsed.data.published_at || new Date().toISOString())
    : (parsed.data.published_at || null);
  const expiresAt = parsed.data.expires_at || null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .insert({
      id: parsed.data.id || crypto.randomUUID(),
      society_id: societyId,
      created_by: profile.id,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: parsed.data.status,
      is_pinned: parsed.data.is_pinned,
      published_at: publishedAt,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create notice" };
  }

  // Handle attachments
  const attachmentUrls = formData.getAll("attachment_urls").filter(Boolean) as string[];
  const attachmentNames = formData.getAll("attachment_names").filter(Boolean) as string[];

  if (attachmentUrls.length > 0) {
    const rows = attachmentUrls.map((fileUrl, index) => ({
      notice_id: data.id,
      file_url: fileUrl,
      file_name: attachmentNames[index] ?? null,
    }));

    const { error: attachmentError } = await supabase
      .from("notice_attachments")
      .insert(rows);

    if (attachmentError) {
      return { error: attachmentError.message, id: data.id };
    }
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");

  return { success: "Notice created successfully", id: data.id };
}

export async function updateNoticeAction(
  _prevState: NoticeActionState,
  formData: FormData
): Promise<NoticeActionState> {
  const profile = await requireAdmin();

  const parsed = updateNoticeSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    is_pinned: formData.get("is_pinned") === "true",
    published_at: formData.get("published_at") || null,
    expires_at: formData.get("expires_at") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  const supabase = await createClient();

  // Validate owner / society match
  const { data: existing, error: fetchError } = await supabase
    .from("notices")
    .select("society_id")
    .eq("id", parsed.data.id)
    .single();

  if (fetchError || !existing) {
    return { error: "Notice not found" };
  }

  if (existing.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  const publishedAt = parsed.data.status === "published"
    ? (parsed.data.published_at || new Date().toISOString())
    : (parsed.data.published_at || null);
  const expiresAt = parsed.data.expires_at || null;

  // 1. Fetch old attachments from database first
  const { data: oldAttachments } = await supabase
    .from("notice_attachments")
    .select("file_url")
    .eq("notice_id", parsed.data.id);

  const oldUrls = (oldAttachments ?? []).map((a) => a.file_url);

  // 2. Perform database notice update
  const { error } = await supabase
    .from("notices")
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      priority: parsed.data.priority,
      status: parsed.data.status,
      is_pinned: parsed.data.is_pinned,
      published_at: publishedAt,
      expires_at: expiresAt,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  // Handle attachments: replace all for simplicity
  const attachmentUrls = formData.getAll("attachment_urls").filter(Boolean) as string[];
  const attachmentNames = formData.getAll("attachment_names").filter(Boolean) as string[];

  await supabase
    .from("notice_attachments")
    .delete()
    .eq("notice_id", parsed.data.id);

  if (attachmentUrls.length > 0) {
    const rows = attachmentUrls.map((fileUrl, index) => ({
      notice_id: parsed.data.id,
      file_url: fileUrl,
      file_name: attachmentNames[index] ?? null,
    }));

    const { error: attachmentError } = await supabase
      .from("notice_attachments")
      .insert(rows);

    if (attachmentError) {
      return { error: attachmentError.message, id: parsed.data.id };
    }
  }

  revalidatePath("/admin/notices");
  revalidatePath(`/admin/notices/${parsed.data.id}`);
  revalidatePath("/notices");
  revalidatePath(`/notices/${parsed.data.id}`);

  // 3. Post-transaction storage cleanup: remove unreferenced files
  let warningMessage: string | undefined = undefined;
  const newUrls = attachmentUrls;
  const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));

  if (removedUrls.length > 0) {
    try {
      const { error: deleteStorageError } = await supabase.storage
        .from("notice-files")
        .remove(removedUrls);
      
      if (deleteStorageError) {
        console.error("Failed to delete stale storage files:", deleteStorageError);
        warningMessage = "Notice updated successfully, but some removed attachments could not be deleted from storage.";
      }
    } catch (err) {
      console.error("Exception during storage delete:", err);
      warningMessage = "Notice updated successfully, but storage cleanup encountered an error.";
    }
  }

  return { 
    success: "Notice updated successfully", 
    id: parsed.data.id,
    ...(warningMessage ? { warning: warningMessage } : {})
  };
}

export async function togglePinNoticeAction(noticeId: string): Promise<NoticeActionState> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("notices")
    .select("is_pinned, society_id")
    .eq("id", noticeId)
    .single();

  if (fetchError || !existing) {
    return { error: "Notice not found" };
  }

  if (existing.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notices")
    .update({ is_pinned: !existing.is_pinned })
    .eq("id", noticeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/notices");
  revalidatePath(`/admin/notices/${noticeId}`);
  revalidatePath("/notices");
  revalidatePath(`/notices/${noticeId}`);

  return { success: "Pin toggled successfully" };
}

export async function deleteNoticeAction(noticeId: string): Promise<NoticeActionState> {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("notices")
    .select("society_id")
    .eq("id", noticeId)
    .single();

  if (fetchError || !existing) {
    return { error: "Notice not found" };
  }

  if (existing.society_id !== profile.society_id) {
    return { error: "Unauthorized" };
  }

  // 1. Fetch attachments before database delete
  const { data: attachments } = await supabase
    .from("notice_attachments")
    .select("file_url")
    .eq("notice_id", noticeId);

  const urls = (attachments ?? []).map((a) => a.file_url);

  // 2. Perform database delete (cascades database attachments)
  const { error } = await supabase
    .from("notices")
    .delete()
    .eq("id", noticeId);

  if (error) {
    return { error: error.message };
  }

  // 3. Post-transaction storage cleanup
  if (urls.length > 0) {
    try {
      const { error: deleteStorageError } = await supabase.storage
        .from("notice-files")
        .remove(urls);
      if (deleteStorageError) {
        console.error("Failed to delete files from storage on notice delete:", deleteStorageError);
      }
    } catch (err) {
      console.error("Exception during storage cleanup on delete:", err);
    }
  }

  revalidatePath("/admin/notices");
  revalidatePath("/notices");

  return { success: "Notice deleted successfully" };
}

export async function markNoticeAsReadAction(noticeId: string): Promise<NoticeActionState> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error: upsertError } = await supabase
    .from("notice_reads")
    .upsert({
      notice_id: noticeId,
      profile_id: profile.id,
    }, {
      onConflict: "notice_id,profile_id"
    });

  if (upsertError) {
    return { error: upsertError.message };
  }

  return { success: "Notice marked as read" };
}
