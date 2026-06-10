"use client";

import { useActionState } from "react";

import { updateProfileAction, type AuthActionState } from "@/lib/auth/actions";
import type { Profile } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-md">
      <div className="space-y-xs">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
      </div>

      <div className="space-y-xs">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
      </div>

      {state.error ? (
        <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-lg border border-primary/20 bg-primary-fixed/30 px-md py-sm text-body-md text-on-surface">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
