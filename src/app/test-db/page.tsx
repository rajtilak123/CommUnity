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
  try {
    const supabase = await createClient();

    const { data, error } = await Promise.race([
      supabase.from("societies").select("*"),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Query timed out after ${QUERY_TIMEOUT_MS / 1000}s`)),
          QUERY_TIMEOUT_MS,
        );
      }),
    ]);

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

type PolicyCheckResult = {
  ok: boolean;
  loggedIn: boolean;
  userEmail: string;
  userId: string;
  profilesCount: number;
  profiles: { id: string; full_name?: string | null; email?: string; role?: string; society_id?: string | null }[];
  error?: string;
};

async function checkProfilesPolicy(): Promise<PolicyCheckResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { ok: true, loggedIn: false, userEmail: "", userId: "", profilesCount: 0, profiles: [] };
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, society_id");

    if (error) {
      return { ok: false, loggedIn: true, userEmail: user.email ?? "", userId: user.id, profilesCount: 0, profiles: [], error: error.message };
    }

    return {
      ok: true,
      loggedIn: true,
      userEmail: user.email ?? "",
      userId: user.id,
      profilesCount: profiles?.length ?? 0,
      profiles: profiles ?? []
    };
  } catch (err) {
    return { ok: false, loggedIn: false, userEmail: "", userId: "", profilesCount: 0, profiles: [], error: err instanceof Error ? err.message : String(err) };
  }
}

export default async function TestDbPage() {
  const result = await getSocieties();
  const policyCheck = await checkProfilesPolicy();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Database Connection Test</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Server-side query against the <code className="rounded bg-muted px-1 py-0.5">societies</code>{" "}
          table via Supabase.
        </p>

        {!result.ok ? (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-medium text-destructive">Failed to load societies</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{result.error}</p>
          </div>
        ) : result.societies.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No societies found.</p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border">
            {result.societies.map((society) => (
              <li key={society.id} className="px-4 py-3">
                <p className="font-medium">{getSocietyLabel(society)}</p>
                <dl className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  <div className="grid grid-cols-[8rem_1fr] gap-2">
                    <dt>id</dt>
                    <dd className="font-mono text-xs text-on-surface">{society.id}</dd>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] gap-2">
                    <dt>name</dt>
                    <dd className="text-on-surface">{String(society.name)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold tracking-tight">Profiles RLS Policy Check</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Validates what profiles can be read by the logged-in session to verify RLS policy state.
        </p>

        {!policyCheck.ok ? (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="font-medium text-destructive">Error checking profiles policy</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{policyCheck.error}</p>
          </div>
        ) : !policyCheck.loggedIn ? (
          <div className="mt-4 rounded-lg border border-warning/50 bg-warning/10 p-4 text-warning">
            No active session found. Please log in first at the main application page.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
              <p><strong>Logged In User:</strong> {policyCheck.userEmail} ({policyCheck.userId})</p>
              <p><strong>Accessible Profiles Count:</strong> {policyCheck.profilesCount}</p>
              <p>
                <strong>Status:</strong>{" "}
                {policyCheck.profilesCount > 1 ? (
                  <span className="text-success font-medium">POLICY ALREADY EXISTS (Can read multiple profiles)</span>
                ) : (
                  <span className="text-warning font-medium">POLICY DOES NOT EXIST (Can only read own profile)</span>
                )}
              </p>
            </div>

            {policyCheck.profiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Visible Profile Records:</p>
                <ul className="divide-y rounded-lg border text-sm">
                  {policyCheck.profiles.map((p) => (
                    <li key={p.id} className="px-4 py-2 flex justify-between gap-4">
                      <span>{p.full_name || "—"} ({p.email})</span>
                      <span className="font-mono text-xs">{p.role} | Society: {p.society_id || "null"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
