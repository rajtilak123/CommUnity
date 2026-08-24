"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
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
    <div className="rounded-none border border-outline-variant bg-surface p-xl">
      <form action={formAction} className="space-y-lg">
        <div className="space-y-xs">
          <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">Email Address</Label>
          <div className="group relative">
            <Mail className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="bg-transparent py-3 pl-11 font-mono text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-xs">
          <div className="flex items-center justify-between px-xs">
            <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">Password</Label>
          </div>
          <div className="group relative">
            <Lock className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-transparent py-3 pl-11 pr-11 font-mono text-sm"
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
          <p className="rounded-none border border-accent bg-accent/10 px-md py-sm font-mono text-xs text-accent">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full rounded-none border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary hover:bg-surface hover:text-primary transition-all"
        >
          {isPending ? "Signing in..." : "Login to Portal"}
          {!isPending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </form>
    </div>
  );
}

export function LoginBrand() {
  return (
    <div className="mb-xl flex flex-col items-center text-center">
      <Link href="/" className="mb-md inline-flex items-center gap-2.5 focus-visible:outline-none">
        <Image
          src="/branding/community-icon.png"
          alt="CommUnity Logo"
          width={40}
          height={40}
          className="size-10 object-contain"
          unoptimized
          priority
        />
        <span className="font-serif text-3xl font-bold tracking-tight text-on-surface">
          CommUnity
        </span>
      </Link>
      <p className="text-body-md text-on-surface-variant">
        Where the whole community comes together
      </p>
    </div>
  );
}
