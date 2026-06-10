"use client";

import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useActionState, useState } from "react";

import { signInAction, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl shadow-[0_4px_60px_-12px_rgba(0,0,0,0.05)]">
      <form action={formAction} className="space-y-lg">
        <div className="space-y-xs">
          <Label htmlFor="email">Email</Label>
          <div className="group relative">
            <Mail className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-surface-container-lowest py-3 pl-11"
              required
            />
          </div>
        </div>

        <div className="space-y-xs">
          <div className="flex items-center justify-between px-xs">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="group relative">
            <Lock className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-surface-container-lowest py-3 pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-md top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface-variant"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {state.error ? (
          <p className="rounded-lg border border-error/30 bg-error-container/40 px-md py-sm text-body-md text-on-error-container">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-container py-3.5 text-on-primary-container shadow-md shadow-primary/10 hover:bg-primary-container/90"
        >
          {isPending ? "Signing in..." : "Login"}
          {!isPending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>
    </div>
  );
}

export function LoginBrand() {
  return (
    <div className="mb-xl flex flex-col items-center text-center">
      <div className="mb-md flex size-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
        <Building2 className="size-8 text-on-primary" />
      </div>
      <h1 className="text-headline-lg-mobile font-bold tracking-tight text-primary md:text-headline-lg">
        CommUnity
      </h1>
      <p className="mt-xs text-body-md text-on-surface-variant">
        Welcome back to your digital neighborhood.
      </p>
    </div>
  );
}
