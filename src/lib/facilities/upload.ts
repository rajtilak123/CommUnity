"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "facility-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type UploadedFacilityImage = {
  fileUrl: string;
  fileName: string;
  previewUrl: string;
};

export async function uploadFacilityImages(
  facilityId: string,
  files: File[]
): Promise<UploadedFacilityImage[]> {
  const supabase = createClient();
  const uploads: UploadedFacilityImage[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} exceeds the 10MB limit`);
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${facilityId}/${crypto.randomUUID()}.${ext}`;

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

export async function getSignedFacilityImageUrl(fileUrl: string): Promise<string> {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http") || fileUrl.startsWith("/")) {
    return fileUrl;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(fileUrl, 3600);

    if (error || !data) {
      console.error("Failed to generate signed URL for facility image:", fileUrl, error?.message);
      return "";
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return "";
  }
}
