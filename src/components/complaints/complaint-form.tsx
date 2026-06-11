"use client";

import { Loader2, Send } from "lucide-react";
import { useActionState, useState } from "react";

import { ComplaintAttachmentUploader } from "@/components/complaints/complaint-attachment-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createComplaintAction, type ComplaintActionState } from "@/lib/complaints/actions";
import { complaintCategoryLabels } from "@/lib/complaints/constants";
import type { UploadedImage } from "@/lib/complaints/upload";
import { complaintCategories } from "@/types/complaints";
import { complaintPriorities } from "@/types/ui";
import { cn } from "@/lib/utils";

const initialState: ComplaintActionState = {};

type ComplaintFormProps = {
  userId: string;
};

export function ComplaintForm({ userId }: ComplaintFormProps) {
  const [state, formAction, isPending] = useActionState(createComplaintAction, initialState);
  const [priority, setPriority] = useState<(typeof complaintPriorities)[number]>("medium");
  const [uploads, setUploads] = useState<UploadedImage[]>([]);

  return (
    <form action={formAction} className="flex flex-col gap-lg rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest p-md md:p-xl">
      <div className="flex flex-col gap-xs">
        <Label htmlFor="title" className="px-1 text-label-md text-on-surface-variant">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Brief summary of the issue"
          required
          className="rounded-lg border-outline-variant bg-surface px-md py-sm text-body-md"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="description" className="px-1 text-label-md text-on-surface-variant">
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          placeholder="Provide more details about the problem..."
          className="min-h-[120px] w-full resize-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
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
            className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface px-md py-sm text-body-md transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            defaultValue="maintenance"
          >
            {complaintCategories.map((category) => (
              <option key={category} value={category}>
                {complaintCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <span className="px-1 text-label-md text-on-surface-variant">Priority</span>
          <input type="hidden" name="priority" value={priority} />
          <div className="flex gap-1 rounded-lg border border-outline-variant bg-surface-container p-1">
            {complaintPriorities.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriority(value)}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center rounded-md text-label-md transition-all",
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

      <ComplaintAttachmentUploader userId={userId} onChange={setUploads} />

      {uploads.map((upload) => (
        <input key={upload.fileUrl} type="hidden" name="attachment_urls" value={upload.fileUrl} />
      ))}
      {uploads.map((upload) => (
        <input key={`${upload.fileUrl}-name`} type="hidden" name="attachment_names" value={upload.fileName} />
      ))}

      {state.error ? (
        <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
          {state.error}
        </p>
      ) : null}

      <div className="mt-md flex justify-end border-t border-outline-variant pt-md">
        <Button
          type="submit"
          disabled={isPending}
          className="h-auto w-full gap-sm rounded-lg px-2xl py-md text-body-md font-semibold md:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Complaint
              <Send className="size-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
