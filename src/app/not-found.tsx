import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] w-full min-w-0 items-center justify-center px-4 py-12 bg-background text-on-background">
      <div className="w-full max-w-2xl border-2 border-primary bg-surface p-6 sm:p-10 text-on-surface">
        {/* Top Masthead Header */}
        <header className="flex items-center justify-between border-b-2 border-primary pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center bg-error font-mono text-xs font-bold text-on-error">
              ?
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-on-surface">
              CommUnity
            </span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant font-medium">
            PAGE NOT FOUND
          </span>
        </header>

        {/* Main Content */}
        <section className="py-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-error bg-error-container/20 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-error">
              404 / NOT FOUND
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight text-on-surface">
            Page Not Found
          </h1>

          <p className="text-body-md leading-relaxed text-on-surface-variant max-w-xl">
            The page or resource you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>

          <hr className="border-t border-outline-variant" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-primary px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <Home className="size-4" />
              Return to Portal
            </Link>
          </div>
        </section>

        {/* Footer info line */}
        <footer className="border-t border-primary pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
          <span>COMMUNITY / DIGITAL NEIGHBORHOOD</span>
          <span>STATUS: 404 RESOLUTION</span>
        </footer>
      </div>
    </div>
  );
}
