// GET /api/app/agents  -> agent configs joined with AGENTS metadata
// POST /api/app/agents -> { agentId, patch }    save a single agent's config
//                      -> { pauseAll: boolean }  global kill switch
//
// Reads/writes via the resilient data layer (src/lib/db/agents-config.ts):
// returns DEMO configs when Supabase is unconfigured so the control panel
// populates with no keys. Writes no-op gracefully in demo mode (ok:false,
// reason:"unconfigured"), which the client surfaces honestly.
//
// FORK NOTE: standard App Router route-handler conventions (named method
// exports returning Response). Verified against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import {
  listAgentConfigs,
  saveAgentConfig,
  pauseAllAgents,
} from "@/lib/db/agents-config";
import { AGENTS } from "@/lib/agents/agents";
import type { AgentAutonomy } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve the effective org id. Demo mode (no auth) still renders via the
// "demo-org" id so the data layer returns its demo dataset.
async function effectiveOrgId(): Promise<string> {
  const { org } = await getUserAndOrg();
  return org?.id ?? "demo-org";
}

const AGENTS_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));

export async function GET(): Promise<Response> {
  const orgId = await effectiveOrgId();
  const configs = await listAgentConfigs(orgId);

  // Join each stored config with its static metadata (name, tagline, toolkits).
  const agents = configs.map((cfg) => {
    const meta = AGENTS_BY_ID[cfg.agent_id];
    return {
      agentId: cfg.agent_id,
      enabled: cfg.enabled,
      autonomy: cfg.autonomy,
      instructions: cfg.instructions ?? "",
      guardrails: cfg.guardrails ?? {},
      updatedAt: cfg.updated_at,
      name: meta?.name ?? cfg.agent_id,
      domain: meta?.domain ?? "",
      tagline: meta?.tagline ?? "",
      toolkits: meta?.toolkits ?? [],
    };
  });

  return Response.json({ agents });
}

const AUTONOMIES: AgentAutonomy[] = ["manual", "approve", "auto"];

type SavePatch = {
  enabled?: boolean;
  autonomy?: AgentAutonomy;
  instructions?: string | null;
  guardrails?: Record<string, unknown>;
};

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "invalid json" }, { status: 400 });
  }
  const orgId = await effectiveOrgId();

  // ---- Kill switch: { pauseAll: boolean } --------------------------------
  if (body && typeof body === "object" && "pauseAll" in body) {
    const paused = Boolean((body as { pauseAll: unknown }).pauseAll);
    const result = await pauseAllAgents(orgId, paused);
    return Response.json({ ...result, paused });
  }

  // ---- Single agent save: { agentId, patch } -----------------------------
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { agentId?: unknown }).agentId !== "string"
  ) {
    return Response.json(
      { ok: false, reason: "agentId required" },
      { status: 400 },
    );
  }

  const { agentId, patch } = body as { agentId: string; patch?: SavePatch };
  if (!AGENTS_BY_ID[agentId]) {
    return Response.json(
      { ok: false, reason: "unknown agent" },
      { status: 400 },
    );
  }

  // Whitelist the fields a client may patch and coerce them safely.
  const clean: SavePatch = {};
  if (patch && typeof patch === "object") {
    if (typeof patch.enabled === "boolean") clean.enabled = patch.enabled;
    if (typeof patch.autonomy === "string" && AUTONOMIES.includes(patch.autonomy)) {
      clean.autonomy = patch.autonomy;
    }
    if (typeof patch.instructions === "string") clean.instructions = patch.instructions;
    if (patch.guardrails && typeof patch.guardrails === "object") {
      clean.guardrails = patch.guardrails;
    }
  }

  const result = await saveAgentConfig(orgId, agentId, clean);
  return Response.json(result);
}
