"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Phone, Home, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateInvitationCodeAction, registerWithInvitationAction, type RegisterActionState } from "@/lib/invitations/actions";

const initialRegisterState: RegisterActionState = {};

export function JoinBrand() {
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

export function JoinForm() {
  const router = useRouter();
  const [step, setStep] = useState<"code" | "register">("code");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Register server action state
  const [regState, regFormAction, isRegPending] = useActionState(
    registerWithInvitationAction,
    initialRegisterState,
  );

  // Handle Step 1: Code Verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);

    const trimmedCode = code.trim().toUpperCase();
    if (trimmedCode.length !== 6) {
      setCodeError("Invitation code must be exactly 6 characters.");
      return;
    }

    setIsValidatingCode(true);

    try {
      const res = await validateInvitationCodeAction(trimmedCode);
      if (res.error || !res.valid) {
        setCodeError(res.error || "Invalid or expired invitation code.");
      } else {
        setValidatedCode(res.code!);
        setStep("register");
      }
    } catch {
      setCodeError("An unexpected error occurred. Please try again.");
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Input sanitizer for invitation code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase().replace(/[^ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g, "");
    if (rawVal.length <= 6) {
      setCode(rawVal);
      setCodeError(null);
    }
  };

  // Handle registration success redirect
  if (regState.success) {
    return (
      <div className="rounded-none border border-outline-variant bg-surface p-xl space-y-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-sm">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="font-serif text-headline-sm font-bold text-on-surface">
          Account Created Successfully!
        </h2>
        <p className="text-body-md text-on-surface-variant">
          Your resident account is now active. You are being redirected to your resident portal...
        </p>
        <Button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full mt-md rounded-none border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary hover:bg-surface hover:text-primary transition-all"
        >
          Go to Resident Dashboard →
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-outline-variant bg-surface p-xl">
      {step === "code" ? (
        /* STEP 1: Enter Invitation Code */
        <form onSubmit={handleVerifyCode} className="space-y-lg">
          <div className="space-y-xs text-center">
            <h2 className="font-serif text-xl font-bold text-on-surface">
              Join Your Community
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Enter the 6-character invitation code provided by your community admin.
            </p>
          </div>

          <div className="space-y-xs">
            <Label htmlFor="code" className="font-mono text-xs uppercase tracking-wider">
              Invitation Code
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder="e.g. K7M4P2"
              className="bg-transparent py-3 text-center font-mono text-xl font-bold tracking-widest uppercase"
              maxLength={6}
              autoComplete="off"
              required
            />
            <p className="text-body-xs text-on-surface-variant text-center">
              6-character code (letters & numbers)
            </p>
          </div>

          {codeError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2.5 rounded-none border border-red-300 dark:border-red-800/80 bg-red-50 dark:bg-red-950/60 p-3.5 text-red-800 dark:text-red-200 shadow-sm"
            >
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span className="font-mono text-xs font-semibold leading-relaxed">{codeError}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isValidatingCode || code.length !== 6}
            className="w-full rounded-none border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary hover:bg-surface hover:text-primary transition-all"
          >
            {isValidatingCode ? "Verifying..." : "CONTINUE →"}
          </Button>

          <div className="text-center pt-xs border-t border-outline-variant">
            <Link
              href="/login"
              className="font-mono text-xs text-on-surface-variant hover:text-on-surface hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: Create Account */
        <form action={regFormAction} className="space-y-lg">
          <input type="hidden" name="code" value={validatedCode || ""} />

          <div className="space-y-xs text-center border-b border-outline-variant pb-md">
            <h2 className="font-serif text-xl font-bold text-on-surface">
              Create Your Community Account
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Enter your details to complete registration for your society.
            </p>
          </div>

          {regState.error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2.5 rounded-none border border-red-300 dark:border-red-800/80 bg-red-50 dark:bg-red-950/60 p-3.5 text-red-800 dark:text-red-200 shadow-sm"
            >
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span className="font-mono text-xs font-semibold leading-relaxed">{regState.error}</span>
            </div>
          )}

          <div className="space-y-md">
            <div className="space-y-xs">
              <Label htmlFor="full_name" className="font-mono text-xs uppercase tracking-wider">
                Full Name
              </Label>
              <div className="group relative">
                <User className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  className="bg-transparent py-3 pl-11 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <div className="group relative">
                <Mail className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="eleanor@example.com"
                  className="bg-transparent py-3 pl-11 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="unit_label" className="font-mono text-xs uppercase tracking-wider">
                Flat / Housing Unit
              </Label>
              <div className="group relative">
                <Home className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="unit_label"
                  name="unit_label"
                  type="text"
                  placeholder="e.g. Apt 4B"
                  className="bg-transparent py-3 pl-11 font-mono text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="phone" className="font-mono text-xs uppercase tracking-wider">
                Phone Number (Optional)
              </Label>
              <div className="group relative">
                <Phone className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. +1 555-0192"
                  className="bg-transparent py-3 pl-11 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider">
                Password
              </Label>
              <div className="group relative">
                <Lock className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent py-3 pl-11 pr-11 font-mono text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface-variant"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-xs">
              <Label htmlFor="confirm_password" className="font-mono text-xs uppercase tracking-wider">
                Confirm Password
              </Label>
              <div className="group relative">
                <Lock className="absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline transition-colors group-focus-within:text-primary" />
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-transparent py-3 pl-11 pr-11 font-mono text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface-variant"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isRegPending}
            className="w-full rounded-none border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary hover:bg-surface hover:text-primary transition-all"
          >
            {isRegPending ? "Creating Account..." : "COMPLETE REGISTRATION →"}
            {!isRegPending && <ArrowRight className="size-4" />}
          </Button>

          <div className="flex items-center justify-between pt-xs border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setStep("code")}
              className="font-mono text-xs text-on-surface-variant hover:text-on-surface hover:underline"
            >
              ← Change Code
            </button>
            <Link
              href="/login"
              className="font-mono text-xs text-on-surface-variant hover:text-on-surface hover:underline"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
