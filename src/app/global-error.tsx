"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";
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
      <head>
        <title>Critical System Error - CommUnity</title>
      </head>
      <body className="min-h-screen bg-background text-on-background font-sans antialiased flex items-center justify-center p-4">
        <div className="w-full max-w-2xl border-2 border-primary bg-surface p-6 sm:p-10 text-on-surface">
          {/* Top Masthead Header */}
          <header className="flex items-center justify-between border-b-2 border-primary pb-4">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center bg-error font-mono text-xs font-bold text-on-error">
                !
              </span>
              <span className="font-serif text-lg font-bold tracking-tight text-on-surface">
                CommUnity
              </span>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant font-medium">
              CRITICAL NOTICE
            </span>
          </header>

          {/* Main Error Content */}
          <section className="py-8 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="border border-error bg-error/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-error">
                FATAL / CRITICAL ERROR
              </span>
              {error.digest && (
                <span className="font-mono text-xs text-on-surface-variant">
                  ID: {error.digest}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-on-surface">
              Critical Application Error
            </h1>

            <p className="text-body-md leading-relaxed text-on-surface-variant max-w-xl">
              CommUnity encountered a critical unrecoverable exception. Please reload the application or return to the main homepage.
            </p>

            <hr className="border-t border-outline-variant" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={reset}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-primary px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              >
                <RotateCcw className="size-4" />
                Reload Application
              </button>

              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-transparent px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-surface transition-all hover:bg-primary hover:text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Home className="size-4" />
                Return to Homepage
              </Link>
            </div>
          </section>

          {/* Footer info line */}
          <footer className="border-t border-primary pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
            <span>COMMUNITY / FATAL RECOVERY</span>
            <span>STATUS: RESTART REQUIRED</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
