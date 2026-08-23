"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { getDefaultFacilityImage } from "@/lib/facilities/constants";
import { getSignedFacilityImageUrl } from "@/lib/facilities/upload";

type DashboardFacilityImageProps = {
  fileUrl?: string;
  facilityName: string;
};

export function DashboardFacilityImage({ fileUrl, facilityName }: DashboardFacilityImageProps) {
  const defaultImage = getDefaultFacilityImage(facilityName);
  const primaryUrl = fileUrl || defaultImage || "";
  const [imageSrc, setImageSrc] = useState(defaultImage || "");

  useEffect(() => {
    let active = true;
    async function loadImage() {
      if (!primaryUrl) {
        if (active) setImageSrc(defaultImage || "");
        return;
      }
      try {
        const signed = await getSignedFacilityImageUrl(primaryUrl);
        if (active) {
          setImageSrc(signed || defaultImage || "");
        }
      } catch (err) {
        console.error("Failed to load signed URL for facility", err);
        if (active) {
          setImageSrc(defaultImage || "");
        }
      }
    }
    void loadImage();
    return () => {
      active = false;
    };
  }, [primaryUrl, defaultImage]);

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={facilityName}
        onError={() => setImageSrc(defaultImage || "")}
        className="size-12 rounded-lg object-cover shrink-0 border border-outline-variant"
      />
    );
  }

  return (
    <div className="size-12 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
      <Building2 className="size-6 opacity-75" />
    </div>
  );
}
