"use client";

import Link from "next/link";
import { Users, Info, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { getDefaultFacilityImage } from "@/lib/facilities/constants";
import { getSignedFacilityImageUrl } from "@/lib/facilities/upload";
import type { FacilityListItem } from "@/types/facilities";
import { cn } from "@/lib/utils";

type FacilityCardProps = {
  facility: FacilityListItem;
  className?: string;
};

export function FacilityCard({ facility, className }: FacilityCardProps) {
  const defaultImage = getDefaultFacilityImage(facility.name);
  const primaryImage = facility.images?.[0]?.file_url || defaultImage || "";
  const [imageSrc, setImageSrc] = useState(defaultImage || "");

  useEffect(() => {
    let active = true;
    async function loadImage() {
      if (!primaryImage) {
        if (active) setImageSrc(defaultImage || "");
        return;
      }
      try {
        const signed = await getSignedFacilityImageUrl(primaryImage);
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
  }, [primaryImage, defaultImage]);

  return (
    <div className={cn("group relative flex flex-col justify-between overflow-hidden rounded-none border border-outline-variant bg-surface transition-all duration-200 hover:border-primary", className)}>
      <div>
        {/* Image Display */}
        <div className="relative aspect-video w-full overflow-hidden bg-surface-container-high border-b border-outline-variant">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={facility.name}
              onError={() => setImageSrc(defaultImage || "")}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-outline">
              <Users className="size-12" />
            </div>
          )}
          
          <div className="absolute left-3 top-3 border border-outline-variant bg-surface px-3 py-1 font-mono text-xs font-semibold text-on-surface flex items-center gap-1">
            <Users className="size-3.5 text-primary" />
            <span>Cap: {facility.capacity}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-md md:p-lg">
          <h3 className="font-serif text-xl font-bold text-on-surface leading-tight transition-colors group-hover:text-primary mb-2">
            {facility.name}
          </h3>
          <p className="line-clamp-2 text-body-md text-on-surface-variant leading-relaxed">
            {facility.description}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-outline-variant p-md flex items-center justify-between">
        <span className="flex items-center gap-1 font-mono text-xs text-outline">
          <Info className="size-3.5" />
          Availability on schedule
        </span>
        <Link
          href={`/facilities/${facility.id}`}
          className="flex h-9 items-center justify-center rounded-none border border-primary bg-primary px-md font-mono text-xs font-bold text-on-primary group-hover:bg-surface group-hover:text-primary transition-all cursor-pointer gap-1"
        >
          Book Now
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
