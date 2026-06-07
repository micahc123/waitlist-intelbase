// Memory Cortex data layer.
// ---------------------------------------------------------------------------
// Turns the agent/client graph into a deterministic dataset of chat / record
// SESSIONS, sorted into ~10 memory CATEGORIES (the cortex regions). Every
// category gets a large headline count plus a materialized, browsable sample
// of sessions for the side panel. Deterministic so the cortex and the panel
// always agree across renders.
// ---------------------------------------------------------------------------

import type { GraphNode } from "@/lib/command/types";
import { seededRand } from "@/lib/command/seed";

// Lucide icon names (resolved to components in the panel).
export interface Category {
  id: string;
  label: string;
  color: string; // intelbase neon palette
  desc: string;
  icon: string; // lucide icon name
  // cluster center in unit cortex space (scaled by CORTEX_RADII at build time)
  center: [number, number, number];
  spread: number; // gaussian sigma of the lobe
  weight: number; // relative share of bulk points
  base: number; // headline session count baseline
}

// Palette: blue, mint, violet, amber, pink, cyan (+ tints). Two hemispheres of
// lobes wrapped around a bright central memory core.
export const CATEGORIES: Category[] = [
  { id: "conversations", label: "Conversations", color: "#6ea8ff", icon: "MessagesSquare",
    desc: "Every live chat thread across channels, parsed and embedded.",
    center: [0.0, 0.34, 0.96], spread: 0.34, weight: 1.25, base: 612 },
  { id: "bookings", label: "Bookings", color: "#7df5c8", icon: "CalendarCheck",
    desc: "Appointments booked, confirmed, rescheduled and held.",
    center: [0.6, 0.5, 0.34], spread: 0.3, weight: 1.0, base: 318 },
  { id: "leads", label: "Leads", color: "#b79cff", icon: "Target",
    desc: "Inbound interest captured, scored and routed to pipeline.",
    center: [-0.6, 0.5, 0.34], spread: 0.3, weight: 1.05, base: 421 },
  { id: "followups", label: "Follow-ups", color: "#ffb86b", icon: "Repeat",
    desc: "Nurture touches and re-engagement sequences in flight.",
    center: [0.78, 0.04, -0.1], spread: 0.3, weight: 0.95, base: 274 },
  { id: "objections", label: "Objections", color: "#ff8fb1", icon: "ShieldAlert",
    desc: "Price, timing and trust pushback handled in thread.",
    center: [-0.78, 0.04, -0.1], spread: 0.3, weight: 0.85, base: 168 },
  { id: "support", label: "Support", color: "#67e8f9", icon: "LifeBuoy",
    desc: "Post-sale questions, issues and how-to resolutions.",
    center: [0.5, -0.5, 0.18], spread: 0.3, weight: 0.95, base: 233 },
  { id: "knowledge", label: "Knowledge", color: "#8b9cff", icon: "BookOpen",
    desc: "Reference facts, FAQs and policies the cortex recalls.",
    center: [-0.5, -0.5, 0.18], spread: 0.3, weight: 0.9, base: 196 },
  { id: "routing", label: "Routing", color: "#c4a2ff", icon: "GitBranch",
    desc: "Hand-offs deciding which agent or human takes a thread.",
    center: [0.32, -0.2, -0.82], spread: 0.3, weight: 0.9, base: 142 },
  { id: "recovery", label: "Recovery", color: "#5ee0b0", icon: "Sparkles",
    desc: "Win-back and reactivation memory for dormant accounts.",
    center: [-0.32, -0.2, -0.82], spread: 0.3, weight: 0.85, base: 121 },
  { id: "signals", label: "Signals", color: "#ffa1c4", icon: "Activity",
    desc: "Intent spikes and anomalies flagged for attention.",
    center: [0.0, 0.62, -0.7], spread: 0.32, weight: 0.95, base: 187 },
];

// Ellipsoid radii: a little wider than tall, longer front-to-back, so the lobes
// wrap into a cortex silhouette.
export const CORTEX_RADII: [number, number, number] = [1.02, 0.86, 1.18];

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

// ---------------------------------------------------------------------------
// Session records
// ---------------------------------------------------------------------------

export type SessionStatus = "resolved" | "active" | "booked" | "escalated" | "archived";

export interface Session {
  id: string;
  category: string;
  title: string;
  snippet: string;
  who: string; // serving agent label
  domain: string; // client / business name
  status: SessionStatus;
  ts: string; // relative time, e.g. "2m", "1h", "3d"
}

export interface CortexData {
  categories: Category[];
  // headline count per category id (reads large)
  counts: Record<string, number>;
  // materialized, browsable sample per category id (~30-60 each)
  sessions: Record<string, Session[]>;
  total: number; // sum of headline counts
}

// Topic fragments per category -> become "Business - topic" titles.
const TOPICS: Record<string, string[]> = {
  conversations: ["pricing question", "opening hours", "new enquiry", "product details", "general chat", "quote request"],
  bookings: ["after hours enquiry", "reschedule", "new appointment", "confirm slot", "cancel + rebook", "deposit hold"],
  leads: ["ad click intake", "form submission", "DM enquiry", "referral lead", "cold reply", "warm handraise"],
  followups: ["day-5 follow-up", "30d re-engage", "quote chase", "post-call recap", "nurture step 3", "reminder nudge"],
  objections: ["price too high", "needs to think", "comparing quotes", "timing not right", "trust concern", "budget hold"],
  support: ["how-to question", "login issue", "refund request", "order status", "feature ask", "bug report"],
  knowledge: ["policy lookup", "FAQ recall", "service scope", "warranty terms", "hours + location", "pricing table"],
  routing: ["escalate to human", "route to sales", "assign specialist", "transfer to ops", "queue overflow", "VIP handoff"],
  recovery: ["win-back offer", "reactivation SMS", "lapsed renewal", "churn save", "dormant nudge", "loyalty perk"],
  signals: ["intent spike", "repeat visitor", "high-value flag", "sentiment drop", "urgency detected", "competitor mention"],
};

const SNIPPETS: Record<string, string[]> = {
  conversations: ["Asked about plans and current promos.", "Wanted to know if you are open Sunday.", "First-time visitor exploring options.", "Comparing two service tiers.", "Casual question, low intent.", "Requested a written quote."],
  bookings: ["Booked outside hours, auto-confirmed.", "Moved Tue 3pm to Thu 11am.", "Slot reserved, deposit pending.", "Confirmed and added to calendar.", "Cancelled then rebooked same week.", "Held slot awaiting deposit."],
  leads: ["New click from Meta campaign, scored 78.", "Filled the contact form on site.", "Slid into IG DMs about pricing.", "Referred by an existing client.", "Replied to a cold sequence.", "Raised hand on the landing page."],
  followups: ["Sent the day-5 nurture touch.", "Re-engaged after 30 days silent.", "Chased an open quote politely.", "Recapped yesterday's discovery call.", "Advanced to sequence step 3.", "Gentle reminder before the slot."],
  objections: ["Said the price felt steep, reframed value.", "Wanted to think it over, set a nudge.", "Comparing three quotes, sent diff.", "Timing not right, parked for Q3.", "Trust hesitation, shared reviews.", "Budget on hold until next month."],
  support: ["Walked them through the setup.", "Reset access and confirmed login.", "Started a refund per policy.", "Shared live order status.", "Logged a feature request.", "Filed a bug with repro steps."],
  knowledge: ["Recalled the cancellation policy.", "Answered from the FAQ store.", "Clarified what is in scope.", "Quoted warranty coverage.", "Gave hours and the address.", "Returned the pricing matrix."],
  routing: ["Escalated to a human agent.", "Routed the thread to sales.", "Assigned a domain specialist.", "Handed to ops for fulfilment.", "Overflow queued to backup.", "Flagged VIP for priority."],
  recovery: ["Sent a tailored win-back offer.", "Fired the reactivation SMS.", "Nudged a lapsed renewal.", "Saved an at-risk account.", "Woke a dormant contact.", "Offered a loyalty perk."],
  signals: ["Detected a sharp intent spike.", "Repeat visit within the hour.", "Tagged as high-value account.", "Sentiment dipped mid-thread.", "Urgency language detected.", "Mentioned a competitor by name."],
};

const STATUSES: SessionStatus[] = ["resolved", "active", "booked", "escalated", "archived"];

// Relative time from a seed, biased toward recent.
function relTime(seed: number): string {
  const r = seededRand(seed);
  if (r < 0.4) return `${1 + Math.floor(seededRand(seed * 3 + 1) * 58)}m`;
  if (r < 0.78) return `${1 + Math.floor(seededRand(seed * 5 + 2) * 23)}h`;
  return `${1 + Math.floor(seededRand(seed * 7 + 3) * 13)}d`;
}

// Pick a status with category-aware bias.
function pickStatus(catId: string, seed: number): SessionStatus {
  const r = seededRand(seed);
  if (catId === "bookings") return r < 0.6 ? "booked" : r < 0.85 ? "active" : "resolved";
  if (catId === "objections" || catId === "routing") return r < 0.35 ? "escalated" : r < 0.7 ? "active" : "resolved";
  if (catId === "recovery") return r < 0.5 ? "active" : r < 0.8 ? "archived" : "resolved";
  if (catId === "knowledge") return r < 0.7 ? "resolved" : "archived";
  return STATUSES[Math.floor(r * STATUSES.length)];
}

/**
 * Build the full cortex dataset from the sim graph nodes. Deterministic.
 * Headline counts read large (hundreds each, ~2.4k total); each category
 * materializes ~30-60 browsable session rows for the side panel.
 */
export function buildSessions(nodes: GraphNode[]): CortexData {
  // Business + agent name pools, derived from the graph so titles feel real.
  const businesses = nodes.filter((n) => n.kind === "client").map((n) => n.label);
  const agents = nodes.filter((n) => n.kind === "agent").map((n) => n.label);
  const bizFallback = ["Harbour Dental", "Kowloon Physio", "North Shore Smoke Shop", "47 Industries"];
  const agentFallback = ["Concierge", "Outreach Bot", "Pipeline Router", "Nurture"];
  const biz = businesses.length ? businesses : bizFallback;
  const agentPool = agents.length ? agents : agentFallback;

  const counts: Record<string, number> = {};
  const sessions: Record<string, Session[]> = {};
  let total = 0;

  CATEGORIES.forEach((cat, ci) => {
    // Headline count: baseline + deterministic jitter, scaled by weight.
    const jitter = Math.floor(seededRand(ci * 131 + 17) * 90);
    const count = Math.round((cat.base + jitter) * (0.85 + cat.weight * 0.15));
    counts[cat.id] = count;
    total += count;

    // Materialize a sample of rows (30-60).
    const sampleN = 34 + Math.floor(seededRand(ci * 53 + 9) * 24);
    const topics = TOPICS[cat.id];
    const snips = SNIPPETS[cat.id];
    const rows: Session[] = [];
    for (let k = 0; k < sampleN; k++) {
      const sd = ci * 1000 + k * 7 + 1;
      const business = biz[Math.floor(seededRand(sd) * biz.length)];
      const topic = topics[Math.floor(seededRand(sd * 2 + 1) * topics.length)];
      const snippet = snips[Math.floor(seededRand(sd * 3 + 2) * snips.length)];
      const who = agentPool[Math.floor(seededRand(sd * 5 + 4) * agentPool.length)];
      rows.push({
        id: `${cat.id}-${k}`,
        category: cat.id,
        title: `${business} - ${topic}`,
        snippet,
        who,
        domain: business,
        status: pickStatus(cat.id, sd * 11 + 6),
        ts: relTime(sd * 13 + 8),
      });
    }
    // Sort newest-ish first (minutes < hours < days), stable for browse.
    const order = (ts: string) => (ts.endsWith("m") ? 0 : ts.endsWith("h") ? 1 : 2) * 100 + parseInt(ts, 10);
    rows.sort((a, b) => order(a.ts) - order(b.ts));
    sessions[cat.id] = rows;
  });

  return { categories: CATEGORIES, counts, sessions, total };
}

// ---------------------------------------------------------------------------
// REAL memory -> CortexData
// ---------------------------------------------------------------------------
// When the org has actual stored memories (pgvector), the Brain view derives the
// Cortex categories/counts and the browsable session list FROM those rows rather
// than the simulated graph. We keep the SAME CATEGORIES (so the 3D cortex lobes
// and the panel stay aligned) and just map each memory.kind onto a region.

// Minimal shape of a memory row as returned by /api/memory/recent. Kept loose so
// the client does not depend on the server types.
export interface MemoryRow {
  id: string;
  kind?: string | null;
  source?: string | null;
  title?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
}

// Map a memory.kind (and source as a hint) onto one of the cortex regions.
function kindToCategory(kind?: string | null, source?: string | null): string {
  const k = (kind ?? "").toLowerCase();
  const s = (source ?? "").toLowerCase();
  if (k === "conversation" || k === "chat" || k === "message") return "conversations";
  if (k === "booking" || k === "appointment" || k === "event" || s.includes("calendar")) return "bookings";
  if (k === "lead") return "leads";
  if (k === "followup" || k === "follow-up" || k === "nurture") return "followups";
  if (k === "objection") return "objections";
  if (k === "support" || k === "ticket") return "support";
  if (k === "knowledge" || k === "faq" || k === "note") return "knowledge";
  if (k === "routing" || k === "handoff") return "routing";
  if (k === "recovery" || k === "winback" || k === "win-back") return "recovery";
  if (k === "signal" || k === "intent") return "signals";
  if (k === "email" || s.includes("gmail") || s.includes("inbox")) return "conversations";
  // Unknown kinds land in Knowledge (the general reference lobe).
  return "knowledge";
}

// Relative "Xm/Xh/Xd" label from an ISO timestamp (now-relative). Falls back to
// a stable label when the timestamp is missing/unparseable.
function relFromIso(iso?: string | null): string {
  if (!iso) return "1d";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "1d";
  const mins = Math.max(0, Math.floor((Date.now() - then) / 60000));
  if (mins < 60) return `${Math.max(1, mins)}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// Map a memory row to a panel Session.
function rowToSession(row: MemoryRow, catId: string): Session {
  const title = (row.title ?? "").trim();
  const content = (row.content ?? "").replace(/\s+/g, " ").trim();
  const snippet = content.slice(0, 160) || "Stored memory.";
  const who = (row.source ?? "").trim() || "Agent";
  return {
    id: row.id,
    category: catId,
    title: title || snippet.slice(0, 60) || "Memory",
    snippet,
    who,
    domain: who,
    status: "resolved",
    ts: relFromIso(row.created_at),
  };
}

/**
 * Build CortexData from REAL memory rows + per-kind stats.
 *
 * - counts: derived from byKind (mapped onto categories). Every region gets at
 *   least its mapped tally; regions with no memories show 0.
 * - sessions: the recent rows bucketed into their mapped region.
 * - total: the real total from stats (sum of byKind).
 *
 * The caller should only use this when stats.total > 0; otherwise it should fall
 * back to buildSessions() (the simulated demo data).
 */
export function buildFromMemories(
  rows: MemoryRow[],
  byKind: Record<string, number>,
  total: number,
): CortexData {
  const counts: Record<string, number> = {};
  for (const cat of CATEGORIES) counts[cat.id] = 0;

  // Roll per-kind totals into the mapped categories so the headline counts and
  // the cortex lobe weights reflect the real distribution.
  for (const [kind, n] of Object.entries(byKind ?? {})) {
    const catId = kindToCategory(kind, null);
    counts[catId] = (counts[catId] ?? 0) + (n ?? 0);
  }

  const sessions: Record<string, Session[]> = {};
  for (const cat of CATEGORIES) sessions[cat.id] = [];
  for (const row of rows ?? []) {
    const catId = kindToCategory(row.kind, row.source);
    (sessions[catId] ??= []).push(rowToSession(row, catId));
  }

  const realTotal =
    total > 0 ? total : Object.values(counts).reduce((a, b) => a + b, 0);

  return { categories: CATEGORIES, counts, sessions, total: realTotal };
}
