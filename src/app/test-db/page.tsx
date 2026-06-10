import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const QUERY_TIMEOUT_MS = 10_000;

type Society = Record<string, unknown> & {
  id: string;
};

type QueryResult =
  | { ok: true; societies: Society[] }
  | { ok: false; error: string };

async function getSocieties(): Promise<QueryResult> {
  console.log("[test-db] env NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing");
  console.log("[test-db] env NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing");

  try {
    console.log("[test-db] creating supabase client...");
    const supabase = await createClient();
    console.log("[test-db] supabase client created, starting societies query...");

    const { data, error } = await Promise.race([
      supabase.from("societies").select("*"),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Query timed out after ${QUERY_TIMEOUT_MS / 1000}s`)),
          QUERY_TIMEOUT_MS,
        );
      }),
    ]);

    console.log("[test-db] query completed", {
      rowCount: data?.length ?? 0,
      error: error?.message ?? null,
    });

    if (error) {
      return { ok: false, error: `${error.code ?? "UNKNOWN"}: ${error.message}` };
    }

    return { ok: true, societies: (data ?? []) as Society[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[test-db] query failed:", message);
    return { ok: false, error: message };
  }
}

function getSocietyLabel(society: Society): string {
  if (typeof society.name === "string" && society.name.length > 0) {
    return society.name;
  }

  return society.id;
}

export default async function TestDbPage() {
  const result = await getSocieties();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Database Connection Test</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Server-side query against the <code className="rounded bg-muted px-1 py-0.5">societies</code>{" "}
        table via Supabase.
      </p>

      {!result.ok ? (
        <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">Failed to load societies</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground">{result.error}</p>
        </div>
      ) : result.societies.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No societies found.</p>
      ) : (
        <ul className="mt-8 divide-y rounded-lg border">
          {result.societies.map((society) => (
            <li key={society.id} className="px-4 py-3">
              <p className="font-medium">{getSocietyLabel(society)}</p>
              <dl className="mt-2 grid gap-1 text-sm">
                {Object.entries(society).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[8rem_1fr] gap-2">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-mono text-xs break-all">
                      {value === null ? "null" : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}

      {result.ok && (
        <p className="mt-6 text-sm text-muted-foreground">
          {result.societies.length} {result.societies.length === 1 ? "society" : "societies"} loaded.
        </p>
      )}
    </main>
  );
}
