// GET /api/integrations/callback?toolkit=...&state=...
//
// Composio returns the browser here after the user completes the OAuth flow for
// a toolkit. We refresh the connection status (which writes the connected flag
// and connected account id into the connections row) and then redirect the user
// back into the app (or to a safe destination passed via `state`).
//
// Resilient by design: if Composio is unconfigured or anything fails, we still
// redirect somewhere sensible rather than erroring.
//
// FORK NOTE: standard route-handler conventions (see 15-route-handlers.md).

import { getUserAndOrg } from "@/lib/auth";
import { refreshConnectionStatus } from "@/lib/integrations/composio";
import { isKnownToolkit } from "@/lib/integrations/toolkits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only allow redirecting to internal app paths to avoid open-redirects.
function safeDestination(state: string | null): string {
  if (state && state.startsWith("/") && !state.startsWith("//")) {
    return state;
  }
  return "/app";
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const toolkit = String(searchParams.get("toolkit") ?? "").trim();
  const dest = safeDestination(searchParams.get("state"));

  try {
    const { org } = await getUserAndOrg();
    if (org && toolkit && isKnownToolkit(toolkit)) {
      // Updates the connections row from Composio's live state. No-op when
      // Composio is unconfigured.
      await refreshConnectionStatus(org.id, toolkit);
    }
  } catch {
    // Never block the redirect on a status refresh failure.
  }

  return Response.redirect(new URL(dest, origin));
}
