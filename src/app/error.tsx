"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

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
    <div className="flex min-h-[70vh] w-full min-w-0 items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl border-2 border-[#111111] bg-[#F9F9F7] p-6 sm:p-10 text-[#111111]">
        {/* Top Masthead Header */}
        <header className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center bg-[#CC0000] font-mono text-xs font-bold text-[#FFFFFF]">
              !
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-[#111111]">
              CommUnity
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#737373]">
            SYSTEM NOTICE
          </span>
        </header>

        {/* Main Error Content */}
        <section className="py-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-[#CC0000] bg-[#CC0000]/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-[#CC0000]">
              ERROR / 500
            </span>
            {error.digest && (
              <span className="font-mono text-xs text-[#737373]">
                ID: {error.digest}
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-[#111111]">
            Something Went Wrong
          </h1>

          <p className="text-base leading-relaxed text-[#525252] max-w-xl">
            An unexpected error occurred while loading this page. Please try again or return to the community dashboard.
          </p>

          <hr className="border-t border-[#E5E5E0]" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={reset}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-[#111111] bg-[#111111] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F9F9F7] transition-all hover:bg-[#F9F9F7] hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] cursor-pointer"
            >
              <RotateCcw className="size-4" />
              Try Again
            </button>

            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-[#111111] bg-transparent px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#111111] transition-all hover:bg-[#111111] hover:text-[#F9F9F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <Home className="size-4" />
              Return Home
            </Link>
          </div>
        </section>

        {/* Footer info line */}
        <footer className="border-t border-[#111111] pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#737373] uppercase tracking-wider">
          <span>COMMUNITY / DIGITAL NEIGHBORHOOD</span>
          <span>STATUS: UNHANDLED RECOVERY</span>
        </footer>
      </div>
    </div>
  );
}
