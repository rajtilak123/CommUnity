"use client";

import { useEffect, useState } from "react";
import { getDefaultFacilityImage } from "@/lib/facilities/constants";
import { getSignedFacilityImageUrl } from "@/lib/facilities/upload";
import type { FacilityImage } from "@/types/facilities";
import { Users } from "lucide-react";

type FacilityImageGalleryProps = {
  images: FacilityImage[];
  facilityName: string;
};

export function FacilityImageGallery({ images, facilityName }: FacilityImageGalleryProps) {
  const defaultImage = getDefaultFacilityImage(facilityName);
  const [signedUrls, setSignedUrls] = useState<string[]>(defaultImage ? [defaultImage] : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const urlsToLoad = images.length > 0
        ? images.map((img) => img.file_url)
        : defaultImage
        ? [defaultImage]
        : [];

      if (urlsToLoad.length === 0) {
        if (active) setLoading(false);
        return;
      }
      try {
        const urls = await Promise.all(
          urlsToLoad.map((url) => getSignedFacilityImageUrl(url))
        );
        if (active) {
          const validUrls = urls.filter(Boolean);
          setSignedUrls(validUrls.length > 0 ? validUrls : defaultImage ? [defaultImage] : []);
        }
      } catch (err) {
        console.error("Failed to load facility gallery images", err);
        if (active && defaultImage) {
          setSignedUrls([defaultImage]);
        }
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
  }, [images, defaultImage]);

  if (loading) {
    return (
      <div className="aspect-video w-full rounded-none bg-surface-container-high animate-pulse" />
    );
  }

  if (signedUrls.length === 0) {
    return (
      <div className="aspect-video w-full rounded-none bg-surface-container-high flex items-center justify-center text-outline">
        <Users className="size-16" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-md">
      <div className="relative aspect-video max-h-[360px] w-full overflow-hidden rounded-none bg-surface-container-high border border-outline-variant">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signedUrls[0]}
          alt={facilityName}
          className="size-full object-cover"
        />
      </div>
      {signedUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-sm">
          {signedUrls.slice(1, 5).map((url, idx) => (
            <div key={idx} className="relative aspect-video overflow-hidden rounded-none bg-surface-container border border-outline-variant">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${facilityName} gallery ${idx + 1}`}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
