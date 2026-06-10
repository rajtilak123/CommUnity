"use client";

type TestDbErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TestDbError({ error, reset }: TestDbErrorProps) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Database Connection Test</h1>
      <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="font-medium text-destructive">Failed to load societies</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
