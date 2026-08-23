"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, Mail, Phone, Calendar, AlertTriangle, CheckCircle, XCircle, Building } from "lucide-react";
import type { Profile } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateResidentStatusAction,
  toggleResidentActiveAction,
  updateResidentRoleAction,
  updateUnitLabelAction,
} from "@/lib/residents/actions";
import { cn } from "@/lib/utils";

type ResidentDetailViewProps = {
  resident: Profile;
  societyName?: string;
};

export function ResidentDetailView({ resident, societyName }: ResidentDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [unitLabel, setUnitLabel] = useState(resident.unit_label || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync unitLabel state whenever the server refreshes the resident prop.
  // Without this, router.refresh() updates the prop but React reuses the
  // component instance, leaving unitLabel stuck at the pre-save value.
  useEffect(() => {
    setUnitLabel(resident.unit_label || "");
  }, [resident.unit_label]);

  // Role promotion confirmation state
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"resident" | "admin">(resident.role);

  // Deactivation confirmation state
  const [showActiveConfirm, setShowActiveConfirm] = useState(false);

  const handleStatusUpdate = (status: "approved" | "rejected") => {
    setError(null);
    setSuccess(null);

    if (status === "approved" && !unitLabel.trim()) {
      setError("Unit designation is required for approval");
      return;
    }

    startTransition(async () => {
      const res = await updateResidentStatusAction(resident.id, status, unitLabel);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(res.success || `Resident successfully ${status}`);
        router.refresh();
      }
    });
  };

  const handleToggleActive = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const nextState = !resident.is_active;
      const res = await toggleResidentActiveAction(resident.id, nextState);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(res.success || "");
        setShowActiveConfirm(false);
        router.refresh();
      }
    });
  };

  const handleRoleUpdate = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await updateResidentRoleAction(resident.id, selectedRole);
      if (res.error) {
        setError(res.error);
        setSelectedRole(resident.role);
      } else {
        setSuccess(res.success || "");
        setShowRoleConfirm(false);
        router.refresh();
      }
    });
  };

  const handleUnitUpdate = () => {
    setError(null);
    setSuccess(null);

    if (!unitLabel.trim()) {
      setError("Unit designation is required");
      return;
    }

    startTransition(async () => {
      const res = await updateUnitLabelAction(resident.id, unitLabel);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Unit designation updated successfully");
        router.refresh();
      }
    });
  };

  return (
    <div className="grid gap-lg lg:grid-cols-3">
      {/* Profile Overview Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-md">
            <div className="flex size-14 items-center justify-center rounded-full bg-surface-container-high text-headline-sm text-on-surface-variant font-semibold">
              {resident.full_name ? resident.full_name[0].toUpperCase() : resident.email[0].toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-headline-sm text-on-surface">
                {resident.full_name || "Unknown Name"}
              </CardTitle>
              <div className="flex items-center gap-sm mt-sm">
                {resident.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded bg-primary-container/20 px-2 py-0.5 text-label-sm font-semibold uppercase text-primary">
                    <Shield className="size-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-secondary-container/20 px-2 py-0.5 text-label-sm font-semibold uppercase text-secondary">
                    <User className="size-3" /> Resident
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-label-sm font-semibold uppercase tracking-wider",
                  resident.status === "approved" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                  resident.status === "rejected" ? "bg-rose-500/10 text-rose-700 border-rose-500/20" :
                  "bg-amber-500/10 text-amber-700 border-amber-500/20"
                )}>
                  {resident.status}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-lg border-t border-outline-variant pt-lg">
          {/* Details list */}
          <div className="grid gap-md md:grid-cols-2">
            <div className="flex items-center gap-sm text-on-surface-variant">
              <Mail className="size-5 text-outline" />
              <div className="min-w-0">
                <div className="text-label-sm font-medium">Email Address</div>
                <div className="text-body-md text-on-surface truncate">{resident.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <Phone className="size-5 text-outline" />
              <div>
                <div className="text-label-sm font-medium">Phone Number</div>
                <div className="text-body-md text-on-surface">{resident.phone || "Not provided"}</div>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <Calendar className="size-5 text-outline" />
              <div>
                <div className="text-label-sm font-medium">Joined Date</div>
                <div className="text-body-md text-on-surface">
                  {new Date(resident.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <Building className="size-5 text-outline" />
              <div>
                <div className="text-label-sm font-medium">Society</div>
                <div className="text-body-md text-on-surface">
                  {societyName && !societyName.toLowerCase().includes("demo") ? societyName : "CommUnity"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className={cn("size-2.5 rounded-full", resident.is_active ? "bg-emerald-500" : "bg-outline-variant")} />
              <div>
                <div className="text-label-sm font-medium">Account State</div>
                <div className="text-body-md text-on-surface">
                  {resident.is_active ? "Active" : "Suspended"}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-sm rounded-lg bg-rose-500/10 border border-rose-500/20 p-md text-body-md text-error">
              <XCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-sm rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-md text-body-md text-primary">
              <CheckCircle className="size-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Unit Designation Management */}
          {resident.status === "approved" && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md space-y-md">
              <div className="space-y-sm">
                <Label htmlFor="unitLabel">Unit Designation</Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
                  <Input
                    id="unitLabel"
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    placeholder="e.g. A-101"
                    disabled={isPending}
                    className="w-full sm:w-64 h-10 px-md text-body-md"
                  />
                  <button
                    type="button"
                    onClick={handleUnitUpdate}
                    disabled={isPending}
                    className="rounded-lg bg-primary px-md h-10 text-label-md font-semibold text-on-primary transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
                  >
                    {isPending ? "Saving..." : "Update Unit"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Actions Sidebar */}
      <div className="space-y-lg">
        {/* Onboarding Approval Card */}
        {resident.status !== "approved" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-xs">Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-body-md text-on-surface-variant">
                This account is currently <strong>{resident.status}</strong>. Please assign a unit number to approve this resident.
              </p>
              <div className="space-y-sm">
                <Label htmlFor="unitAssign">Assign Unit Designation</Label>
                <Input
                  id="unitAssign"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder="e.g. A-101"
                  disabled={isPending}
                  className="w-full h-10 px-md text-body-md"
                />
              </div>
              <div className="flex flex-col gap-sm pt-sm">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={isPending}
                  className="w-full rounded-lg bg-primary py-md text-label-md font-semibold text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "Processing..." : "Approve Account"}
                </button>
                {resident.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={isPending}
                    className="w-full rounded-lg border border-outline bg-surface py-md text-label-md font-semibold text-error hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50"
                  >
                    Reject Registration
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resident Activation/Role Promotion Card */}
        {resident.status === "approved" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-headline-xs font-semibold">Account Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              {/* Suspend / Reactivate controls */}
              <div className="space-y-md">
                <h4 className="text-label-md font-bold uppercase text-on-surface-variant">Suspension</h4>
                <p className="text-body-sm text-on-surface-variant">
                  {resident.is_active
                    ? "Suspended users will be immediately locked out of their accounts and portal actions."
                    : "Reactivate this account to restore full portal authorization."}
                </p>
                {!showActiveConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowActiveConfirm(true)}
                    className={cn(
                      "w-full rounded-lg py-md text-label-md font-semibold text-white transition-all hover:opacity-90 active:scale-95",
                      resident.is_active ? "bg-rose-600" : "bg-emerald-600"
                    )}
                  >
                    {resident.is_active ? "Suspend Account" : "Activate Account"}
                  </button>
                ) : (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md space-y-md">
                    <div className="flex items-start gap-sm text-body-sm text-on-surface-variant">
                      <AlertTriangle className="size-5 shrink-0 text-amber-500" />
                      <span>
                        Are you sure you want to {resident.is_active ? "suspend" : "activate"} <strong>{resident.full_name || resident.email}</strong>?
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        disabled={isPending}
                        className={cn(
                          "flex-1 rounded-lg py-sm text-label-md font-semibold text-white transition-all hover:opacity-90",
                          resident.is_active ? "bg-rose-600" : "bg-emerald-600"
                        )}
                      >
                        {isPending ? "Processing..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowActiveConfirm(false)}
                        disabled={isPending}
                        className="flex-1 rounded-lg border border-outline bg-surface py-sm text-label-md font-semibold text-on-surface hover:bg-surface-container-high transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role promote / demote controls */}
              <div className="space-y-md border-t border-outline-variant pt-md">
                <h4 className="text-label-md font-bold uppercase text-on-surface-variant">Role Authorization</h4>
                <p className="text-body-sm text-on-surface-variant">
                  Update the authorization level of this user profile.
                </p>
                <div className="flex items-center justify-between gap-md">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value as "resident" | "admin");
                      setShowRoleConfirm(true);
                    }}
                    disabled={isPending}
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg md:text-label-md outline-none focus:border-primary w-full"
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {showRoleConfirm && (
                  <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md space-y-md">
                    <div className="flex items-start gap-sm text-body-sm text-on-surface-variant">
                      <AlertTriangle className="size-5 shrink-0 text-amber-500" />
                      <span>
                        Are you sure you want to change the role from <strong>{resident.role}</strong> to <strong>{selectedRole}</strong>?
                      </span>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        type="button"
                        onClick={handleRoleUpdate}
                        disabled={isPending}
                        className="flex-1 rounded-lg bg-primary py-sm text-label-md font-semibold text-on-primary transition-all hover:opacity-90"
                      >
                        {isPending ? "Updating..." : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRoleConfirm(false);
                          setSelectedRole(resident.role);
                        }}
                        disabled={isPending}
                        className="flex-1 rounded-lg border border-outline bg-surface py-sm text-label-md font-semibold text-on-surface hover:bg-surface-container-high transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
