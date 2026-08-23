"use client";

import Link from "next/link";
import { Edit, Eye, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

import type { FacilityListItem } from "@/types/facilities";
import { getDefaultFacilityImage } from "@/lib/facilities/constants";
import { cn } from "@/lib/utils";

type FacilityTableProps = {
  facilities: FacilityListItem[];
  className?: string;
};

export function FacilityTable({ facilities, className }: FacilityTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant w-20">
                Image
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Name &amp; Description
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Capacity
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-md py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {facilities.map((facility) => {
              const defaultImg = getDefaultFacilityImage(facility.name);
              const thumbnail = facility.images?.[0]?.file_url || defaultImg;
              return (
                <tr key={facility.id} className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-md py-4">
                    <div className="relative aspect-video w-16 overflow-hidden rounded-md border border-outline-variant bg-surface-container">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={facility.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                          <span className="text-[10px] uppercase font-bold text-outline">No Img</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-md py-4">
                    <p className="text-body-md font-medium text-on-surface">{facility.name}</p>
                    <p className="mt-1 text-label-md text-on-surface-variant line-clamp-1 max-w-md">
                      {facility.description}
                    </p>
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface font-medium">
                    {facility.capacity} pax
                  </td>
                  <td className="px-md py-4">
                    {facility.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-label-md font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2.5 py-0.5 text-label-md font-semibold text-error">
                        <XCircle className="size-3.5" />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-md py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/facilities/${facility.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-outline px-3 text-label-md font-medium text-on-surface hover:bg-surface-container shadow-sm transition-all"
                        title="View Resident Page"
                        target="_blank"
                      >
                        <Eye className="mr-1.5 size-4" />
                        Preview
                      </Link>

                      <Link
                        href={`/admin/facilities/${facility.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-3 text-label-md font-semibold text-on-secondary hover:bg-secondary/95 shadow-sm transition-all"
                        title="Edit Facility"
                      >
                        <Edit className="mr-1.5 size-4" />
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
