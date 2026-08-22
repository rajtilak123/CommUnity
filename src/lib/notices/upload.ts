"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "notice-files";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type UploadedFile = {
  fileUrl: string;
  fileName: string;
  previewUrl: string;
};

export async function uploadNoticeFiles(
  noticeId: string,
  files: File[]
): Promise<UploadedFile[]> {
  const supabase = createClient();
  const uploads: UploadedFile[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} exceeds the 10MB limit`);
    }

    const ext = file.name.split(".").pop() ?? "bin";
    // Place file in directory named after the noticeId
    const path = `${noticeId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    uploads.push({
      fileUrl: path,
      fileName: file.name,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    });
  }

  return uploads;
}

export async function getSignedNoticeFileUrl(fileUrl: string): Promise<string> {
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(fileUrl, 3600);

    if (error || !data) {
      console.error("Failed to generate signed URL for notice file:", fileUrl, error?.message);
      return "";
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return "";
  }
}
