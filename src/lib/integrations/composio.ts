// Composio integrations client for the Intelbase AI OS.
//
// Each ORG is a Composio user/entity: we use `org.id` as the Composio userId
// everywhere. This module owns:
//   - the memoized Composio client (VercelProvider, so tools come back in the
//     AI-SDK shape that the agent runtime spreads into generateText({ tools })),
//   - per-org OAuth connect (startConnect),
//   - connection status refresh + listing,
//   - fetching AI-SDK tools for an org's connected toolkits,
//   - the simulated-connection fallback used when Composio is not configured.
//
// RESILIENCE: everything is gated on isComposioConfigured(). With no
// COMPOSIO_API_KEY set, the client is never constructed, connect/tool helpers
// return empty/simulated values, and nothing throws at import or request time.
// The connections table still works (reading/writing simulated toggles) because
// it only depends on Supabase, not Composio.
//
// SDK methods used (verified against node_modules/@composio/core 0.10.0):
//   new Composio({ apiKey, provider: new VercelProvider() })
//   composio.toolkits.authorize(userId, toolkitSlug) -> ConnectionRequest
//       { id, status?, redirectUrl? }   (no per-call redirect option in this
//       SDK version; the post-auth redirect is configured on the Composio auth
//       config / dashboard, so callers send the user to redirectUrl and Composio
//       returns the browser to our configured callback.)
//   composio.connectedAccounts.list({ userIds, toolkitSlugs }) -> { items: [...] }
//       each item: { id, status, toolkit: { slug }, ... }
//   composio.tools.get(userId, { toolkits: [...] }) -> AI-SDK tool record
//       (VercelProvider.wrapTools output).

import { createClient } from "@/lib/supabase/server";
import {
  TOOLKIT_SLUGS,
  TOOLKITS_BY_SLUG,
} from "@/lib/integrations/toolkits";

// Loosely typed Composio client. We avoid importing the SDK types at module
// scope so this file stays cheap to import; the dynamic import in getComposio()
// is the only place the SDK is loaded.
type AuthConfigItem = {
  id: string;
  toolkit?: { slug?: string } | string;
  toolkitSlug?: string;
};
type ComposioClient = {
  authConfigs: {
    list: (
      query?: Record<string, unknown>,
    ) => Promise<{ items?: AuthConfigItem[] } | AuthConfigItem[]>;
  };
  connectedAccounts: {
    // Composio v3: managed-OAuth connections are created via link(userId, authConfigId).
    link: (
      userId: string,
      authConfigId: string,
    ) => Promise<{ id?: string; redirectUrl?: string | null }>;
    list: (query?: {
      userIds?: string[];
      toolkitSlugs?: string[];
      statuses?: string[];
    }) => Promise<{
      items: Array<{ id: string; status: string; toolkit: { slug: string } }>;
    }>;
  };
  tools: {
    get: (
      userId: string,
      filters: { toolkits?: string[] },
    ) => Promise<Record<string, unknown>>;
  };
};

// Cache of toolkit slug -> auth config id (so we do not list on every connect).
const authConfigCache = new Map<string, string>();

async function authConfigIdFor(
  composio: ComposioClient,
  toolkitSlug: string,
): Promise<string | null> {
  const slug = toolkitSlug.toLowerCase();
  const cached = authConfigCache.get(slug);
  if (cached) return cached;
  try {
    const res = await composio.authConfigs.list({});
    const items: AuthConfigItem[] = Array.isArray(res) ? res : (res.items ?? []);
    for (const a of items) {
      const s = (
        (typeof a.toolkit === "object" ? a.toolkit?.slug : a.toolkit) ??
        a.toolkitSlug ??
        ""
      )
        .toString()
        .toLowerCase();
      if (s === slug && a.id) {
        authConfigCache.set(slug, a.id);
        return a.id;
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

export function isComposioConfigured(): boolean {
  return Boolean(process.env.COMPOSIO_API_KEY);
}

// Base URL for building the OAuth callback link. Mirrors the convention used by
// the billing portal route.
function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "https://intelbase.studio"
  );
}

export function callbackUrl(toolkitSlug: string): string {
  const base = appUrl().replace(/\/$/, "");
  return `${base}/api/integrations/callback?toolkit=${encodeURIComponent(
    toolkitSlug,
  )}`;
}

// Memoized client. We cache the promise so concurrent callers share one
// construction, and null out the cache only when unconfigured.
let clientPromise: Promise<ComposioClient | null> | null = null;

export function getComposio(): Promise<ComposioClient | null> {
  if (!isComposioConfigured()) return Promise.resolve(null);
  if (clientPromise) return clientPromise;

  clientPromise = (async () => {
    try {
      const [{ Composio }, { VercelProvider }] = await Promise.all([
        import("@composio/core"),
        import("@composio/vercel"),
      ]);
      const composio = new Composio({
        apiKey: process.env.COMPOSIO_API_KEY,
        provider: new VercelProvider(),
      });
      return composio as unknown as ComposioClient;
    } catch {
      // Never throw at construction: fall back to the unconfigured path.
      return null;
    }
  })();

  return clientPromise;
}

// Composio statuses we treat as "connected".
function isActiveStatus(status?: string | null): boolean {
  return String(status ?? "").toUpperCase() === "ACTIVE";
}

// Upsert a connections row without relying on a unique (org_id, provider)
// constraint: delete the existing row for this provider, then insert a fresh
// one (the same delete-then-insert pattern onboarding uses).
async function upsertConnection(
  orgId: string,
  provider: string,
  connected: boolean,
  meta: Record<string, unknown> = {},
): Promise<boolean> {
  try {
    const supabase = await createClient();
    await supabase
      .from("connections")
      .delete()
      .eq("org_id", orgId)
      .eq("provider", provider);

    const { error } = await supabase.from("connections").insert({
      org_id: orgId,
      provider,
      connected,
      meta,
    });
    return !error;
  } catch {
    return false;
  }
}

export type StartConnectResult = {
  redirectUrl: string | null;
  connectionId?: string;
  simulated?: boolean;
};

// Begin an OAuth connect for an org + toolkit. Returns the redirectUrl the
// browser should be sent to. Persists a pending (connected:false) row so the UI
// reflects an in-progress connection. When unconfigured, returns a simulated
// result with no redirect.
export async function startConnect(
  orgId: string,
  toolkitSlug: string,
): Promise<StartConnectResult> {
  const composio = await getComposio();
  if (!composio) {
    return { redirectUrl: null, simulated: true };
  }

  try {
    // Composio v3: resolve the toolkit's auth config, then create a managed-OAuth
    // connection link which returns the redirect URL for the end user.
    const authConfigId = await authConfigIdFor(composio, toolkitSlug);
    if (!authConfigId) return { redirectUrl: null, simulated: true };

    const req = await composio.connectedAccounts.link(orgId, authConfigId);
    const redirectUrl = req?.redirectUrl ?? null;

    // Record a pending connection so status reads reflect the in-flight OAuth.
    await upsertConnection(orgId, toolkitSlug, false, {
      connectionId: req?.id ?? null,
      authConfigId,
      status: "INITIATED",
      callbackUrl: callbackUrl(toolkitSlug),
    });

    return {
      redirectUrl,
      connectionId: req?.id,
    };
  } catch {
    // On any SDK failure, fall back to the simulated path so the UI can degrade
    // gracefully rather than erroring.
    return { redirectUrl: null, simulated: true };
  }
}

// Query Composio for the live connection state of an org + toolkit and update
// the connections row (connected flag + connected account id in meta). Returns
// whether the toolkit is now connected. Safe / no-op when unconfigured.
export async function refreshConnectionStatus(
  orgId: string,
  toolkitSlug: string,
): Promise<boolean> {
  const composio = await getComposio();
  if (!composio) return false;

  try {
    const res = await composio.connectedAccounts.list({
      userIds: [orgId],
      toolkitSlugs: [toolkitSlug],
    });
    const items = res?.items ?? [];
    // Prefer an ACTIVE account; otherwise take the most recent item we got.
    const active = items.find((i) => isActiveStatus(i.status));
    const chosen = active ?? items[0];

    const connected = Boolean(active);
    await upsertConnection(orgId, toolkitSlug, connected, {
      connectionId: chosen?.id ?? null,
      status: chosen?.status ?? "INACTIVE",
    });

    return connected;
  } catch {
    return false;
  }
}

export type ConnectionRow = { provider: string; connected: boolean };

// Read the org's connections from the DB. Works even when Composio is
// unconfigured, so it reflects simulated toggles from onboarding.
export async function listConnections(orgId: string): Promise<ConnectionRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("connections")
      .select("provider, connected")
      .eq("org_id", orgId);

    if (error || !data) return [];
    return data.map((r) => ({
      provider: String(r.provider),
      connected: Boolean(r.connected),
    }));
  } catch {
    return [];
  }
}

// Fetch AI-SDK-shaped tools for an org, scoped to the requested toolkit slugs
// (or to the org's currently connected toolkits when none are given). The agent
// runtime spreads the returned record into generateText({ tools }). Returns {}
// when unconfigured or on any failure.
export async function getToolsForOrg(
  orgId: string,
  toolkitSlugs?: string[],
): Promise<Record<string, unknown>> {
  const composio = await getComposio();
  if (!composio) return {};

  try {
    let slugs = (toolkitSlugs ?? []).filter((s) => TOOLKITS_BY_SLUG[s]);

    // No explicit subset: use the org's connected toolkits from the DB.
    if (slugs.length === 0) {
      const connections = await listConnections(orgId);
      slugs = connections
        .filter((c) => c.connected && TOOLKITS_BY_SLUG[c.provider])
        .map((c) => c.provider);
    }

    // Nothing connected / requested: nothing to fetch.
    if (slugs.length === 0) return {};

    // De-dupe and constrain to known toolkits.
    const unique = Array.from(new Set(slugs)).filter((s) =>
      TOOLKIT_SLUGS.includes(s),
    );
    if (unique.length === 0) return {};

    const tools = await composio.tools.get(orgId, { toolkits: unique });
    return (tools as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

// Mark a connection as connected/disconnected without touching Composio. Used
// by the simulated fallback (the onboarding toggle path) so the UI can record a
// connection even with no COMPOSIO_API_KEY. Returns success.
export async function markSimulatedConnection(
  orgId: string,
  toolkitSlug: string,
  connected: boolean,
): Promise<boolean> {
  return upsertConnection(orgId, toolkitSlug, connected, { simulated: true });
}
