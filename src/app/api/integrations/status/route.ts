// GET /api/integrations/status
//
// Returns the signed-in org's connection state as JSON:
//   { configured: boolean, connections: [{ provider, connected }, ...] }
// configured: true when COMPOSIO_API_KEY is set (real OAuth possible).
// Reads connections from the DB - only real (non-simulated) rows should exist
// after the removal of the simulated-connect fallback.
//
// FORK NOTE: standard route-handler conventions (see 15-route-handlers.md).

import { getUserAndOrg } from "@/lib/auth";
import { isComposioConfigured, listConnections } from "@/lib/integrations/composio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const { user, org } = await getUserAndOrg();
  if (!user || !org) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const configured = isComposioConfigured();
  const connections = await listConnections(org.id);
  return Response.json({ configured, connections });
}
