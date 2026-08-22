"use client";

import Link from "next/link";
import { Users, Info, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { getSignedFacilityImageUrl } from "@/lib/facilities/upload";
import type { FacilityListItem } from "@/types/facilities";
import { cn } from "@/lib/utils";

type FacilityCardProps = {
  facility: FacilityListItem;
  className?: string;
};

export function FacilityCard({ facility, className }: FacilityCardProps) {
  const [imageSrc, setImageSrc] = useState("");
  const primaryImage = facility.images?.[0]?.file_url;

  useEffect(() => {
    let active = true;
    async function loadImage() {
      if (!primaryImage) return;
      try {
        const signed = await getSignedFacilityImageUrl(primaryImage);
        if (active) {
          setImageSrc(signed);
        }
      } catch (err) {
        console.error("Failed to load signed URL for facility", err);
      }
    }
    void loadImage();
    return () => {
      active = false;
    };
  }, [primaryImage]);

  return (
    <div className={cn("group relative flex flex-col justify-between overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface transition-all duration-300 hover:border-primary hover:shadow-lg", className)}>
      <div>
        {/* Image Display */}
        <div className="relative aspect-video w-full overflow-hidden bg-surface-container-high">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={facility.name}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-outline-variant">
              <Users className="size-12" />
            </div>
          )}
          
          <div className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-label-md font-semibold text-on-surface flex items-center gap-1 shadow-sm">
            <Users className="size-3.5 text-primary" />
            <span>Cap: {facility.capacity}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-md md:p-lg">
          <h3 className="text-headline-sm font-bold text-on-surface leading-tight transition-colors group-hover:text-primary mb-2">
            {facility.name}
          </h3>
          <p className="line-clamp-2 text-body-md text-on-surface-variant leading-relaxed">
            {facility.description}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-outline-variant/60 p-md flex items-center justify-between">
        <span className="flex items-center gap-1 text-label-md text-outline font-medium">
          <Info className="size-4" />
          Click to view availability
        </span>
        <Link
          href={`/facilities/${facility.id}`}
          className="flex h-9 items-center justify-center rounded-lg bg-surface-container-high px-md text-label-md font-semibold text-primary group-hover:bg-primary group-hover:text-on-primary transition-all cursor-pointer gap-1"
        >
          Book Now
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
