"use client";

import { Loader2, Save, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { NoticeAttachmentUploader, type SelectedFile } from "@/components/notices/notice-attachment-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNoticeAction, updateNoticeAction } from "@/lib/notices/actions";
import { noticeCategoryLabels, noticeStatusLabels } from "@/lib/notices/constants";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { noticeCategories, noticePriorities, noticeStatuses, type NoticeWithRelations } from "@/types/notices";
import { cn } from "@/lib/utils";

type NoticeFormProps = {
  notice?: NoticeWithRelations;
};

function formatToDatetimeLocal(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function NoticeForm({ notice }: NoticeFormProps) {
  const router = useRouter();
  const isEditing = !!notice;
  const [noticeId] = useState(() => notice?.id || crypto.randomUUID());
  const [hasCreatedRecord, setHasCreatedRecord] = useState(isEditing);
  
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [priority, setPriority] = useState<typeof noticePriorities[number]>(
    notice?.priority || "medium"
  );
  const [isPinned, setIsPinned] = useState(notice?.is_pinned || false);
  const [uploads, setUploads] = useState<SelectedFile[]>(() => 
    notice?.attachments.map(att => ({
      fileUrl: att.file_url,
      fileName: att.file_name || "",
      previewUrl: att.file_url
    })) || []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setWarning(null);

    const form = e.currentTarget;
    const baseFormData = new FormData(form);
    const currentId = noticeId;

    try {
      // 1. If not editing and record has not been created yet, create draft notice in DB
      if (!isEditing && !hasCreatedRecord) {
        const createFormData = new FormData();
        createFormData.set("id", currentId);
        createFormData.set("title", baseFormData.get("title") || "");
        createFormData.set("content", baseFormData.get("content") || "");
        createFormData.set("category", baseFormData.get("category") || "general");
        createFormData.set("priority", priority);
        createFormData.set("status", "draft"); // force draft status
        createFormData.set("is_pinned", isPinned ? "true" : "false");
        
        const publishedAt = baseFormData.get("published_at");
        if (publishedAt) createFormData.set("published_at", publishedAt as string);
        const expiresAt = baseFormData.get("expires_at");
        if (expiresAt) createFormData.set("expires_at", expiresAt as string);

        const result = await createNoticeAction({}, createFormData);
        if (result.error) {
          setError(result.error);
          setIsSaving(false);
          return;
        }
        setHasCreatedRecord(true);
      }

      // 2. Upload any attachments client-side to Supabase Storage under noticeId folder
      const supabase = createSupabaseClient();
      const updatedUploads = [...uploads];

      for (let i = 0; i < updatedUploads.length; i++) {
        const upload = updatedUploads[i];
        if (upload.file) {
          const file = upload.file;
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} exceeds the 10MB limit.`);
          }
          const ext = file.name.split(".").pop() ?? "bin";
          const path = `${currentId}/${crypto.randomUUID()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("notice-files")
            .upload(path, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }

          // Success! Clear file object and set fileUrl
          updatedUploads[i] = {
            ...upload,
            fileUrl: path,
            file: undefined,
          };
          
          // Update the state so far to keep progress if later files fail
          setUploads([...updatedUploads]);
        }
      }

      // 3. Finalize the database record (set status, link attachments)
      const updateFormData = new FormData();
      updateFormData.set("id", currentId);
      updateFormData.set("title", baseFormData.get("title") || "");
      updateFormData.set("content", baseFormData.get("content") || "");
      updateFormData.set("category", baseFormData.get("category") || "general");
      updateFormData.set("priority", priority);
      updateFormData.set("status", baseFormData.get("status") || "draft");
      updateFormData.set("is_pinned", isPinned ? "true" : "false");

      const publishedAt = baseFormData.get("published_at");
      if (publishedAt) updateFormData.set("published_at", publishedAt as string);
      const expiresAt = baseFormData.get("expires_at");
      if (expiresAt) updateFormData.set("expires_at", expiresAt as string);

      updatedUploads.forEach((upload) => {
        if (upload.fileUrl) {
          updateFormData.append("attachment_urls", upload.fileUrl);
          updateFormData.append("attachment_names", upload.fileName);
        }
      });

      const result = await updateNoticeAction({}, updateFormData);
      if (result.error) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      if (result.warning) {
        setWarning(result.warning);
        // Wait a small bit to let the user see the warning or let it handle/propagate if needed
      }

      router.push("/admin/notices");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during saving.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-xl">
      <div className="flex flex-col gap-xs">
        <Label htmlFor="title" className="px-1 text-label-md text-on-surface-variant">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={notice?.title}
          placeholder="Brief summary or heading of the notice"
          required
          className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="content" className="px-1 text-label-md text-on-surface-variant">
          Content
        </Label>
        <textarea
          id="content"
          name="content"
          defaultValue={notice?.content}
          rows={6}
          required
          placeholder="Provide detail description/announcement text..."
          className="min-h-[150px] w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="category" className="px-1 text-label-md text-on-surface-variant">
            Category
          </Label>
          <select
            id="category"
            name="category"
            defaultValue={notice?.category || "general"}
            className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            {noticeCategories.map((category) => (
              <option key={category} value={category}>
                {noticeCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <span className="px-1 text-label-md text-on-surface-variant">Priority</span>
          <div className="flex gap-1 rounded-lg border border-outline-variant bg-surface-container p-1">
            {noticePriorities.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={cn(
                  "flex h-11 md:h-9 flex-1 items-center justify-center rounded-md text-label-md transition-all",
                  priority === value
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                  value === "urgent" && priority === value && "text-error",
                )}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
        <div className="flex flex-col gap-xs">
          <Label htmlFor="status" className="px-1 text-label-md text-on-surface-variant">
            Status
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={notice?.status || "draft"}
            className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-lg md:text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
          >
            {noticeStatuses.map((status) => (
              <option key={status} value={status}>
                {noticeStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <Label htmlFor="published_at" className="px-1 text-label-md text-on-surface-variant">
            Publish Date/Time
          </Label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={formatToDatetimeLocal(notice?.published_at)}
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>

        <div className="flex flex-col gap-xs">
          <Label htmlFor="expires_at" className="px-1 text-label-md text-on-surface-variant">
            Expiration Date/Time
          </Label>
          <Input
            id="expires_at"
            name="expires_at"
            type="datetime-local"
            defaultValue={formatToDatetimeLocal(notice?.expires_at)}
            className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-md rounded-lg border border-outline-variant bg-surface-container/30 p-md">
        <input
          id="is_pinned"
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="size-5 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <div className="flex flex-col">
          <Label htmlFor="is_pinned" className="text-body-md font-semibold text-on-surface cursor-pointer">
            Pin to Top
          </Label>
          <span className="text-label-md text-on-surface-variant">
            Pinned notices remain highlighted at the top of the resident feed.
          </span>
        </div>
      </div>

      <NoticeAttachmentUploader
        initialUploads={uploads}
        onChange={setUploads}
      />

      {error ? (
        <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
          {error}
        </p>
      ) : null}

      {warning ? (
        <p className="rounded-lg border border-warning/30 bg-warning-container/40 px-md py-sm text-body-md text-on-warning-container">
          {warning}
        </p>
      ) : null}

      <div className="mt-md flex justify-end gap-sm border-t border-outline-variant pt-md">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-auto w-full gap-sm rounded-lg px-2xl py-md text-body-md font-semibold md:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              Save Notice
              <Save className="size-5" />
            </>
          ) : (
            <>
              Create Notice
              <Send className="size-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
