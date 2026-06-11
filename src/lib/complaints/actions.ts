"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addCommentSchema,
  createComplaintSchema,
  updateComplaintStatusSchema,
} from "@/lib/validations/complaints";
import { requireAdmin, requireProfile, requireResident } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ComplaintActionState = {
  error?: string;
  success?: string;
};

async function resolveSocietyId(profileSocietyId: string | null): Promise<string> {
  if (profileSocietyId) {
    return profileSocietyId;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("societies").select("id").limit(1).single();

  if (error || !data) {
    throw new Error("No society configured. Please contact your administrator.");
  }

  return data.id as string;
}

export async function createComplaintAction(
  _prevState: ComplaintActionState,
  formData: FormData,
): Promise<ComplaintActionState> {
  const profile = await requireResident();
  const parsed = createComplaintSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  let societyId: string;

  try {
    societyId = await resolveSocietyId(profile.society_id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to resolve society" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      society_id: societyId,
      created_by: profile.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority,
      reference_code: "",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create complaint" };
  }

  const attachmentUrls = formData.getAll("attachment_urls").filter(Boolean) as string[];
  const attachmentNames = formData.getAll("attachment_names").filter(Boolean) as string[];

  if (attachmentUrls.length > 0) {
    const rows = attachmentUrls.map((fileUrl, index) => ({
      complaint_id: data.id,
      file_url: fileUrl,
      file_name: attachmentNames[index] ?? null,
    }));

    const { error: attachmentError } = await supabase.from("complaint_attachments").insert(rows);

    if (attachmentError) {
      return { error: attachmentError.message };
    }
  }

  revalidatePath("/complaints");
  redirect(`/complaints/${data.id}`);
}

export async function addComplaintCommentAction(
  _prevState: ComplaintActionState,
  formData: FormData,
): Promise<ComplaintActionState> {
  const profile = await requireProfile();
  const parsed = addCommentSchema.safeParse({
    complaintId: formData.get("complaintId"),
    content: formData.get("content"),
    isInternal: formData.get("isInternal") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  if (parsed.data.isInternal && profile.role !== "admin") {
    return { error: "Only admins can post internal comments" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("complaint_comments").insert({
    complaint_id: parsed.data.complaintId,
    author_id: profile.id,
    content: parsed.data.content,
    is_internal: parsed.data.isInternal,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/complaints/${parsed.data.complaintId}`);
  revalidatePath(`/admin/complaints/${parsed.data.complaintId}`);

  return { success: "Comment posted" };
}

export async function updateComplaintStatusAction(
  _prevState: ComplaintActionState,
  formData: FormData,
): Promise<ComplaintActionState> {
  await requireAdmin();

  const parsed = updateComplaintStatusSchema.safeParse({
    complaintId: formData.get("complaintId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid status update" };
  }

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("complaints")
    .select("status")
    .eq("id", parsed.data.complaintId)
    .single();

  if (fetchError || !existing) {
    return { error: "Complaint not found" };
  }

  const { error } = await supabase
    .from("complaints")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.complaintId);

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.note && existing.status !== parsed.data.status) {
    const { data: history } = await supabase
      .from("complaint_status_history")
      .select("id")
      .eq("complaint_id", parsed.data.complaintId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (history) {
      await supabase
        .from("complaint_status_history")
        .update({ note: parsed.data.note })
        .eq("id", history.id);
    }
  }

  revalidatePath("/admin/complaints");
  revalidatePath(`/admin/complaints/${parsed.data.complaintId}`);
  revalidatePath(`/complaints/${parsed.data.complaintId}`);

  return { success: "Status updated" };
}

export async function assignComplaintAction(
  _prevState: ComplaintActionState,
  formData: FormData,
): Promise<ComplaintActionState> {
  await requireAdmin();

  const complaintId = formData.get("complaintId");
  const assigneeId = formData.get("assigneeId");

  if (typeof complaintId !== "string" || typeof assigneeId !== "string") {
    return { error: "Invalid assignment data" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("complaints")
    .update({ assigned_to: assigneeId || null })
    .eq("id", complaintId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/complaints/${complaintId}`);

  return { success: "Assignment updated" };
}
