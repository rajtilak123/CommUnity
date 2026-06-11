"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "complaint-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type UploadedImage = {
  fileUrl: string;
  fileName: string;
  previewUrl: string;
};

export async function uploadComplaintImages(
  userId: string,
  files: File[],
): Promise<UploadedImage[]> {
  const supabase = createClient();
  const uploads: UploadedImage[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`${file.name} is not an image file`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} exceeds the 10MB limit`);
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

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
      previewUrl: URL.createObjectURL(file),
    });
  }

  return uploads;
}

export async function getSignedComplaintImageUrl(fileUrl: string): Promise<string> {
  if (fileUrl.startsWith("http")) {
    return fileUrl;
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(fileUrl, 3600);

  if (error || !data) {
    return fileUrl;
  }

  return data.signedUrl;
}
