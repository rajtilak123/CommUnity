"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getSignedComplaintImageUrl } from "@/lib/complaints/upload";
import { cn } from "@/lib/utils";

type ComplaintImageProps = {
  path: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

export function ComplaintImage({ path, alt, className, fill, width, height }: ComplaintImageProps) {
  const [src, setSrc] = useState(path.startsWith("http") ? path : "");

  useEffect(() => {
    let active = true;

    async function load() {
      if (path.startsWith("http")) {
        setSrc(path);
        return;
      }

      const signed = await getSignedComplaintImageUrl(path);
      if (active) {
        setSrc(signed);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [path]);

  if (!src) {
    return <div className={cn("animate-pulse bg-surface-container-high", className)} />;
  }

  if (fill) {
    return <Image src={src} alt={alt} fill className={className} unoptimized />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 400}
      className={className}
      unoptimized
    />
  );
}
