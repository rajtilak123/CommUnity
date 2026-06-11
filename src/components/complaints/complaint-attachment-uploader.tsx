"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import type { UploadedImage } from "@/lib/complaints/upload";
import { uploadComplaintImages } from "@/lib/complaints/upload";
import { cn } from "@/lib/utils";

type ComplaintAttachmentUploaderProps = {
  userId: string;
  onChange: (uploads: UploadedImage[]) => void;
  className?: string;
};

export function ComplaintAttachmentUploader({
  userId,
  onChange,
  className,
}: ComplaintAttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const next = await uploadComplaintImages(userId, Array.from(fileList));
      const merged = [...uploads, ...next];
      setUploads(merged);
      onChange(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function removeAt(index: number) {
    const merged = uploads.filter((_, i) => i !== index);
    setUploads(merged);
    onChange(merged);
  }

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <label className="px-1 text-label-md text-on-surface-variant">Reference Images</label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          void handleFiles(e.dataTransfer.files);
        }}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-[0.75rem] border-2 border-dashed border-outline-variant bg-surface p-xl transition-colors hover:bg-surface-container-low"
      >
        <div className="mb-md flex size-12 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
          <ImagePlus className="size-6 text-primary" />
        </div>
        <p className="text-body-md font-semibold text-on-surface">
          {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-label-md text-on-surface-variant">PNG, JPG, or HEIC (max. 10MB)</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {error ? <p className="text-body-md text-error">{error}</p> : null}

      {uploads.length > 0 ? (
        <div className="mt-sm flex flex-wrap gap-sm">
          {uploads.map((upload, index) => (
            <div
              key={upload.fileUrl}
              className="group relative size-20 overflow-hidden rounded-lg border border-outline-variant"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={upload.previewUrl} alt={upload.fileName} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
