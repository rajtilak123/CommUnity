"use client";

import Link from "next/link";
import { CheckCircle, Edit, Eye } from "lucide-react";

import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  complaintCategoryLabels,
  formatComplaintDate,
  formatComplaintReference,
} from "@/lib/complaints/constants";
import type { ComplaintListItem } from "@/types/complaints";
import { getProfileInitials } from "@/lib/auth/profile-utils";
import { cn } from "@/lib/utils";

type ComplaintTableProps = {
  complaints: ComplaintListItem[];
  className?: string;
};

export function ComplaintTable({ complaints, className }: ComplaintTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-[0.75rem] border border-outline-variant bg-surface-container-lowest shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Complaint ID
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Resident
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Title &amp; Category
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Priority
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Status
              </th>
              <th className="px-md py-4 text-label-md uppercase tracking-wider text-on-surface-variant">
                Date
              </th>
              <th className="px-md py-4 text-right text-label-md uppercase tracking-wider text-on-surface-variant">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {complaints.map((complaint) => {
              const authorName = complaint.author?.full_name ?? "Resident";
              const initials = getProfileInitials({ full_name: authorName });

              return (
                <tr key={complaint.id} className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-md py-4 text-body-md font-bold text-primary">
                    {formatComplaintReference(complaint.reference_code)}
                  </td>
                  <td className="px-md py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-tertiary-fixed text-[12px] font-bold text-on-tertiary-fixed">
                        {initials}
                      </div>
                      <div>
                        <p className="text-body-md font-medium text-on-surface">{authorName}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {complaint.author?.unit_label ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-md py-4">
                    <p className="text-body-md font-medium text-on-surface">{complaint.title}</p>
                    <p className="mt-1 inline-block rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant">
                      {complaintCategoryLabels[complaint.category]}
                    </p>
                  </td>
                  <td className="px-md py-4">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-md py-4">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-md py-4 text-body-md text-on-surface-variant">
                    {formatComplaintDate(complaint.created_at)}
                  </td>
                  <td className="px-md py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <Link
                        href={`/admin/complaints/${complaint.id}`}
                        className="rounded-lg p-2 text-primary transition-colors hover:bg-primary-container"
                        title="View Details"
                      >
                        <Eye className="size-5" />
                      </Link>
                      <Link
                        href={`/admin/complaints/${complaint.id}`}
                        className="rounded-lg p-2 text-secondary transition-colors hover:bg-secondary-container"
                        title="Update Status"
                      >
                        <Edit className="size-5" />
                      </Link>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-error transition-colors hover:bg-error-container"
                        title="Close Complaint"
                      >
                        <CheckCircle className="size-5" />
                      </button>
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
