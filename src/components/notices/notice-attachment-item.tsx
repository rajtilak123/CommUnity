"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Eye, Loader2 } from "lucide-react";

import { getSignedNoticeFileUrl } from "@/lib/notices/upload";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NoticeAttachmentItemProps = {
  fileUrl: string;
  fileName: string | null;
  className?: string;
};

export function NoticeAttachmentItem({ fileUrl, fileName, className }: NoticeAttachmentItemProps) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const name = fileName || fileUrl.split("/").pop() || "Attachment";
  const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp|heic|heif)$/i);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (downloading) return;

    setDownloading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("notice-files").download(fileUrl);

      if (error || !data) {
        throw new Error(error?.message || "Failed to download file");
      }

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const signed = await getSignedNoticeFileUrl(fileUrl);
        if (active) {
          setSrc(signed);
        }
      } catch (err) {
        console.error("Failed to load signed URL", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <div className={cn("animate-pulse h-12 rounded-lg bg-surface-container-high", className)} />
    );
  }

  if (!src) {
    return (
      <div className={cn("flex h-12 items-center rounded-lg border border-error/20 bg-error-container/10 px-md py-sm text-label-md text-error", className)}>
        Failed to load file
      </div>
    );
  }

  if (isImage) {
    return (
      <div className={cn("flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface p-sm", className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded bg-surface-container-high">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={name} className="size-full object-cover" />
        </div>
        <div className="flex items-center justify-between gap-sm px-xs">
          <p className="truncate text-body-sm font-semibold text-on-surface flex-1">{name}</p>
          <div className="flex gap-xs shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="View Original"
            >
              <Eye className="size-4" />
            </a>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex size-8 items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
              title="Download"
            >
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-sm rounded-lg border border-outline-variant bg-surface p-md", className)}>
      <div className="flex items-center gap-sm min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-surface-container-high text-primary">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-body-md font-semibold text-on-surface">{name}</p>
        </div>
      </div>
      <div className="flex gap-xs shrink-0">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-8 items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          title="View Original"
        >
          <Eye className="size-4" />
        </a>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex size-8 items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          title="Download"
        >
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </button>
      </div>
    </div>
  );
}
