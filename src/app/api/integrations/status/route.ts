// GET /api/integrations/status
//
// Returns the signed-in org's connection state as JSON:
//   { connections: [{ provider, connected }, ...] }
// Reads from the connections table, so it works even when Composio is
// unconfigured (reflecting simulated toggles from onboarding).
//
// FORK NOTE: standard route-handler conventions (see 15-route-handlers.md).

import { getUserAndOrg } from "@/lib/auth";
import { listConnections } from "@/lib/integrations/composio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const { user, org } = await getUserAndOrg();
  if (!user || !org) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const connections = await listConnections(org.id);
  return Response.json({ connections });
}
