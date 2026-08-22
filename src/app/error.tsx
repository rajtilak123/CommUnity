"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to an error reporting service if needed — never expose to UI
    console.error("[CommUnity Error]", error.digest ?? "unknown");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-md py-xl text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="size-8" />
      </div>

      <h1 className="mt-lg text-headline-md font-bold text-on-surface">
        Something went wrong
      </h1>

      <p className="mt-sm max-w-md text-body-md text-on-surface-variant leading-relaxed">
        An unexpected error occurred. Please try again. If the problem persists,
        contact your society administrator.
      </p>

      {error.digest && (
        <p className="mt-sm font-mono text-label-sm text-outline">
          Error ID: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="mt-xl inline-flex items-center gap-sm rounded-lg bg-primary px-lg py-sm text-label-md font-semibold text-on-primary hover:opacity-90 transition-opacity"
      >
        <RotateCcw className="size-4" />
        Try Again
      </button>
    </div>
  );
}
