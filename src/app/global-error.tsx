"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CommUnity Fatal Error]", error.digest ?? "unknown");
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-on-background px-md py-xl text-center gap-md font-sans">
        <div className="flex size-16 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="text-headline-md font-bold text-on-surface">
          Critical Application Error
        </h1>

        <p className="max-w-md text-body-md text-on-surface-variant leading-relaxed">
          CommUnity encountered a critical error and could not recover. Please
          refresh the page. If this continues, contact your administrator.
        </p>

        {error.digest && (
          <p className="font-mono text-label-sm text-outline">
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center gap-sm bg-primary text-on-primary border-none rounded-lg px-lg py-sm text-label-md font-semibold cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RotateCcw className="size-4" />
          Reload Application
        </button>
      </body>
    </html>
  );
}
