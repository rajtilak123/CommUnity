"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, ArrowRight, CheckCircle2, AlertCircle, LogOut, XCircle } from "lucide-react";
import type { Profile } from "@/types/auth";
import { claimResidentInviteAction, claimAdminBootstrapAction, type OnboardingActionState } from "@/lib/onboarding/actions";
import { signOutAction } from "@/lib/auth/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: OnboardingActionState = {};

type OnboardingViewProps = {
  profile: Profile;
};

export function OnboardingView({ profile }: OnboardingViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"resident" | "admin">("resident");
  
  // Actions hooks
  const [resState, resFormAction, isResPending] = useActionState(claimResidentInviteAction, initialState);
  const [adminState, adminFormAction, isAdminPending] = useActionState(claimAdminBootstrapAction, initialState);

  const isPending = isResPending || isAdminPending;
  const activeState = mode === "resident" ? resState : adminState;
  const userEmail = profile.email;

  const handleSuccessRedirect = () => {
    router.refresh();
  };

  // 1. Pending Approval Screen
  if (profile.society_id && profile.status === "pending") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-lowest p-md">
        <div className="w-full max-w-md space-y-md">
          <div className="text-center space-y-xs">
            <h1 className="text-headline-lg font-bold text-primary tracking-tight">CommUnity</h1>
            <p className="text-body-md text-on-surface-variant">Residential Society Management Portal</p>
          </div>
          <Card className="border border-outline-variant shadow-xl">
            <CardHeader className="text-center pb-0">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-md">
                <AlertCircle className="size-6" />
              </div>
              <CardTitle className="text-headline-sm">Registration Pending Approval</CardTitle>
              <CardDescription className="text-body-md mt-xs">
                Your account is waiting for administrator verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-lg pt-md">
              <div className="rounded-lg bg-surface-container-low p-md space-y-sm text-body-md text-on-surface-variant border border-outline-variant">
                <div>
                  <span className="font-semibold text-on-surface">Email:</span> {profile.email}
                </div>
                <div>
                  <span className="font-semibold text-on-surface">Status:</span> Pending Approval
                </div>
                {profile.unit_label && (
                  <div>
                    <span className="font-semibold text-on-surface">Assigned Unit:</span> {profile.unit_label}
                  </div>
                )}
              </div>
              <p className="text-body-md text-on-surface-variant text-center">
                Please contact your society administrator to approve your registration request. Once approved, refresh this page to access your portal.
              </p>
              <div className="flex flex-col gap-sm">
                <button
                  type="button"
                  onClick={() => router.refresh()}
                  className="w-full flex items-center justify-center gap-sm rounded-lg bg-primary py-md text-label-md font-semibold text-on-primary hover:opacity-90 transition-all active:scale-95"
                >
                  Check Status / Refresh
                </button>
                <button
                  type="button"
                  onClick={() => signOutAction()}
                  className="w-full flex items-center justify-center gap-sm rounded-lg border border-outline bg-surface py-md text-label-md font-semibold text-error hover:bg-surface-container-high transition-all active:scale-95"
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 2. Rejected Screen
  if (profile.society_id && profile.status === "rejected") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-lowest p-md">
        <div className="w-full max-w-md space-y-md">
          <div className="text-center space-y-xs">
            <h1 className="text-headline-lg font-bold text-primary tracking-tight">CommUnity</h1>
            <p className="text-body-md text-on-surface-variant">Residential Society Management Portal</p>
          </div>
          <Card className="border border-outline-variant shadow-xl">
            <CardHeader className="text-center pb-0">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 mb-md">
                <XCircle className="size-6" />
              </div>
              <CardTitle className="text-headline-sm">Registration Rejected</CardTitle>
              <CardDescription className="text-body-md mt-xs">
                Your request to join the society was not accepted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-lg pt-md">
              <div className="rounded-lg bg-surface-container-low p-md space-y-sm text-body-md text-on-surface-variant border border-outline-variant">
                <div>
                  <span className="font-semibold text-on-surface">Email:</span> {profile.email}
                </div>
                <div>
                  <span className="font-semibold text-on-surface">Status:</span> Rejected
                </div>
              </div>
              <p className="text-body-md text-on-surface-variant text-center">
                Your registration request has been rejected. Please contact your society administrator if you believe this is an error or to submit a new request.
              </p>
              <div className="flex flex-col gap-sm">
                <button
                  type="button"
                  onClick={() => signOutAction()}
                  className="w-full flex items-center justify-center gap-sm rounded-lg border border-outline bg-surface py-md text-label-md font-semibold text-error hover:bg-surface-container-high transition-all active:scale-95"
                >
                  <LogOut className="size-4" /> Sign Out
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Unassociated Token Claim Screen
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-lowest p-md">
      <div className="w-full max-w-md space-y-md">
        
        {/* Header Branding */}
        <div className="text-center space-y-xs">
          <h1 className="text-headline-lg font-bold text-primary tracking-tight">CommUnity</h1>
          <p className="text-body-md text-on-surface-variant">Residential Society Management Portal</p>
        </div>

        <Card className="border border-outline-variant shadow-xl">
          <CardHeader>
            <CardTitle className="text-headline-sm">Complete Onboarding</CardTitle>
            <CardDescription className="text-body-md">
              Logged in as <span className="font-semibold text-on-surface">{userEmail}</span>. Your account is unassociated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-lg">
            
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-xs bg-surface-container-high rounded-lg">
              <button
                type="button"
                onClick={() => setMode("resident")}
                className={cn(
                  "flex items-center justify-center gap-sm py-sm rounded-md text-label-md font-semibold transition-all",
                  mode === "resident"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <User className="size-4" /> Resident Onboard
              </button>
              <button
                type="button"
                onClick={() => setMode("admin")}
                className={cn(
                  "flex items-center justify-center gap-sm py-sm rounded-md text-label-md font-semibold transition-all",
                  mode === "admin"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Shield className="size-4" /> Admin Setup
              </button>
            </div>

            {/* Error/Success Alerts */}
            {activeState.error && (
              <div className="flex items-start gap-sm rounded-lg bg-rose-500/10 border border-rose-500/20 p-md text-body-md text-error">
                <AlertCircle className="size-5 shrink-0 text-error mt-0.5" />
                <span>{activeState.error}</span>
              </div>
            )}

            {activeState.success ? (
              <div className="space-y-md rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-md text-center">
                <div className="flex items-center justify-center gap-sm text-body-md text-primary font-semibold">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span>{activeState.success}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSuccessRedirect}
                  className="w-full flex items-center justify-center gap-sm rounded-lg bg-primary py-md text-label-md font-semibold text-on-primary hover:opacity-90 transition-all active:scale-95"
                >
                  Continue to Portal <ArrowRight className="size-4" />
                </button>
              </div>
            ) : (
              /* Claim Forms */
              <form action={mode === "resident" ? resFormAction : adminFormAction} className="space-y-md">
                <div className="space-y-sm">
                  <Label htmlFor="token">
                    {mode === "resident" ? "Resident Invitation Code" : "Admin Bootstrap Token"}
                  </Label>
                  <Input
                    id="token"
                    name="token"
                    placeholder="Enter your one-time onboarding code..."
                    disabled={isPending}
                    required
                    className="w-full"
                  />
                  <p className="text-body-xs text-on-surface-variant">
                    {mode === "resident"
                      ? "Enter the code sent to your email by the society administrator."
                      : "Enter the bootstrap token provided to configure your society."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-sm rounded-lg bg-primary py-md text-label-md font-semibold text-on-primary hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "Validating..." : "Claim Account"}
                </button>
              </form>
            )}

            {/* Logout Option */}
            <div className="border-t border-outline-variant pt-md flex justify-between items-center text-body-sm text-on-surface-variant">
              <span>Not your account?</span>
              <button
                type="button"
                onClick={() => signOutAction()}
                className="flex items-center gap-xs font-semibold text-error hover:underline"
              >
                <LogOut className="size-4" /> Sign Out
              </button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
