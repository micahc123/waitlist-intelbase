// Toolkit catalog for the Composio integrations layer.
//
// Each entry is a toolkit we surface in the UI for an org to connect via OAuth.
// `slug` is the Composio toolkit slug (the value passed to
// `composio.toolkits.authorize(orgId, slug)`); `icon` is a lucide-react icon
// name resolved on the client. `gated` toolkits require extra provider review
// (for example Meta app verification for WhatsApp / Meta Ads) before OAuth can
// be enabled in production, so the UI should surface a note for those.
//
// This file is pure data with no Composio dependency, so it is always safe to
// import even when COMPOSIO_API_KEY is not configured.

export type ToolkitCategory =
  | "email"
  | "calendar"
  | "messaging"
  | "crm"
  | "productivity"
  | "ads";

export type Toolkit = {
  // Composio toolkit slug, used as the authorize() identifier.
  slug: string;
  // Human label for the UI.
  label: string;
  // Short description of what connecting this toolkit enables.
  description: string;
  // lucide-react icon name (resolved on the client).
  icon: string;
  category: ToolkitCategory;
  // Gated toolkits need extra provider verification (for example Meta app
  // review) before OAuth can be turned on in production.
  gated?: boolean;
  // Extra note shown for gated toolkits explaining the gating.
  note?: string;
};

export const TOOLKITS: Toolkit[] = [
  {
    slug: "gmail",
    label: "Gmail",
    description: "Read, send, and triage email from the org's Gmail inbox.",
    icon: "Mail",
    category: "email",
  },
  {
    slug: "googlecalendar",
    label: "Google Calendar",
    description: "Read availability and create or update calendar events.",
    icon: "CalendarClock",
    category: "calendar",
  },
  {
    slug: "slack",
    label: "Slack",
    description: "Post messages and read channels in the org's workspace.",
    icon: "MessageSquare",
    category: "messaging",
  },
  {
    slug: "hubspot",
    label: "HubSpot",
    description: "Sync contacts, deals, and notes with the org's CRM.",
    icon: "Database",
    category: "crm",
  },
  {
    slug: "notion",
    label: "Notion",
    description: "Read and write pages and databases in Notion.",
    icon: "FileText",
    category: "productivity",
  },
  {
    slug: "googlesheets",
    label: "Google Sheets",
    description: "Read and append rows to the org's spreadsheets.",
    icon: "Sheet",
    category: "productivity",
  },
  {
    slug: "whatsapp",
    label: "WhatsApp",
    description: "Send and receive WhatsApp messages via the Business API.",
    icon: "MessageCircle",
    category: "messaging",
    gated: true,
    note: "Requires Meta Business verification before production OAuth can be enabled.",
  },
  {
    slug: "meta_ads",
    label: "Meta Ads",
    description: "Manage Facebook and Instagram ad campaigns and insights.",
    icon: "Megaphone",
    category: "ads",
    gated: true,
    note: "Requires Meta app review and Business verification before production OAuth can be enabled.",
  },
];

// Quick lookup by slug.
export const TOOLKITS_BY_SLUG: Record<string, Toolkit> = Object.fromEntries(
  TOOLKITS.map((t) => [t.slug, t]),
);

export function getToolkit(slug: string): Toolkit | undefined {
  return TOOLKITS_BY_SLUG[slug];
}

export function isKnownToolkit(slug: string): boolean {
  return Boolean(TOOLKITS_BY_SLUG[slug]);
}

// All slugs we surface (handy for "connect everything connected" tool fetches).
export const TOOLKIT_SLUGS: string[] = TOOLKITS.map((t) => t.slug);

// Map the 6 onboarding connector ids (see src/lib/onboarding.ts) to Composio
// toolkit slugs. `website-chat` has no external OAuth toolkit (it is the native
// site widget), so it maps to null and is skipped by the integration layer.
export const ONBOARDING_CONNECTOR_TO_TOOLKIT: Record<string, string | null> = {
  "website-chat": null,
  whatsapp: "whatsapp",
  "email-inbox": "gmail",
  "meta-ads": "meta_ads",
  calendar: "googlecalendar",
  crm: "hubspot",
};

// Resolve an onboarding connector id to a Composio toolkit slug (or null when
// the connector has no external OAuth toolkit).
export function toolkitForConnector(connectorId: string): string | null {
  return ONBOARDING_CONNECTOR_TO_TOOLKIT[connectorId] ?? null;
}
