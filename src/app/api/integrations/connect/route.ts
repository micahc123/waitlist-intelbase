// POST /api/integrations/connect
//
// Begins a per-org Composio OAuth connect for a toolkit. Body: { toolkit }.
// On success returns { url } (the Composio redirectUrl the client should send
// the browser to). When Composio is not configured, returns 503 with
// { simulated: true } so the UI can fall back to its simulated toggle.
//
// FORK NOTE: standard route-handler conventions (see 15-route-handlers.md).

import { getUserAndOrg } from "@/lib/auth";
import {
  isComposioConfigured,
  startConnect,
} from "@/lib/integrations/composio";
import { isKnownToolkit } from "@/lib/integrations/toolkits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (!isComposioConfigured()) {
    return Response.json(
      { error: "Integrations not configured", simulated: true },
      { status: 503 },
    );
  }

  const { user, org } = await getUserAndOrg();
  if (!user || !org) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let toolkit = "";
  try {
    const body = (await request.json()) as { toolkit?: unknown };
    toolkit = String(body?.toolkit ?? "").trim();
  } catch {
    toolkit = "";
  }

  if (!toolkit || !isKnownToolkit(toolkit)) {
    return Response.json({ error: "Unknown toolkit" }, { status: 400 });
  }

  const result = await startConnect(org.id, toolkit);

  if (result.simulated || !result.redirectUrl) {
    // Composio rejected the authorize call (or returned no redirect). Surface
    // the simulated fallback so the UI degrades gracefully.
    return Response.json(
      { error: "Integrations not configured", simulated: true },
      { status: 503 },
    );
  }

  return Response.json({
    url: result.redirectUrl,
    connectionId: result.connectionId,
  });
}
