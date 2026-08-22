"use client";
import { FileUp, Trash2, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SelectedFile = {
  file?: File;
  fileUrl: string;
  fileName: string;
  previewUrl: string;
};

type NoticeAttachmentUploaderProps = {
  onChange: (uploads: SelectedFile[]) => void;
  className?: string;
  initialUploads?: SelectedFile[];
};

export function NoticeAttachmentUploader({
  onChange,
  className,
  initialUploads = [],
}: NoticeAttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<SelectedFile[]>(initialUploads);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const next: SelectedFile[] = Array.from(fileList).map((file) => ({
      file,
      fileUrl: "",
      fileName: file.name,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));

    const merged = [...uploads, ...next];
    setUploads(merged);
    onChange(merged);
  }

  function removeAt(index: number) {
    const merged = uploads.filter((_, i) => i !== index);
    setUploads(merged);
    onChange(merged);
  }

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <label className="px-1 text-label-md text-on-surface-variant">Attachments</label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="group flex cursor-pointer flex-col items-center justify-center rounded-[0.75rem] border-2 border-dashed border-outline-variant bg-surface p-xl transition-colors hover:bg-surface-container-low"
      >
        <div className="mb-md flex size-12 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
          <FileUp className="size-6 text-primary" />
        </div>
        <p className="text-body-md font-semibold text-on-surface">
          Click to upload or drag and drop
        </p>
        <p className="text-label-md text-on-surface-variant">Images, PDF, or Word Docs (max. 10MB)</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploads.length > 0 ? (
        <div className="mt-sm grid grid-cols-1 gap-sm sm:grid-cols-2">
          {uploads.map((upload, index) => {
            const isImage = upload.fileName.match(/\.(jpeg|jpg|gif|png|webp|heic|heif)$/i) || upload.previewUrl;
            return (
              <div
                key={index}
                className="group relative flex items-center gap-sm overflow-hidden rounded-lg border border-outline-variant bg-surface-container p-sm pr-[3rem]"
              >
                {isImage && upload.previewUrl ? (
                  <div className="size-10 overflow-hidden rounded bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={upload.previewUrl} alt={upload.fileName} className="size-full object-cover" />
                  </div>
                ) : (
                  <div className="flex size-10 items-center justify-center rounded bg-surface-container-highest text-on-surface-variant">
                    <FileText className="size-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body-sm font-medium text-on-surface">{upload.fileName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="absolute right-sm top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-outline-variant/20 hover:text-error"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
