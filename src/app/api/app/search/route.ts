// Global search for the /app work shell (the Cmd/Ctrl-K command palette).
//
// GET ?q=<query> -> { query, groups: [{ key, label, view, items: [...] }] }
//   Searches across Leads, Contacts, Conversations, Tasks, and Knowledge by
//   filtering each surface's list() results server-side (case-insensitive
//   substring across the human-readable fields). Each result carries the
//   ViewKey it belongs to so the client can jump straight there.
//
// Reads always succeed: every data module falls back to deterministic DEMO data
// when Supabase is unconfigured or empty, so search stays useful with no keys.
// An empty/blank q returns empty groups (the client shows view shortcuts).
//
// VERIFY AGAINST FORK: standard App Router route handler (named GET returning
// Response, force-dynamic). Confirmed against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import { listContacts } from "@/lib/db/contacts";
import { listConversations } from "@/lib/db/conversations";
import { listKnowledge } from "@/lib/db/knowledge";
import { listLeads } from "@/lib/db/leads";
import { listTasks } from "@/lib/db/tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-group cap so the palette stays scannable.
const PER_GROUP = 6;

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string | null;
  view: string;
}

export interface SearchGroup {
  key: string;
  label: string;
  view: string;
  items: SearchResult[];
}

function matches(query: string, ...fields: Array<string | null | undefined>) {
  return fields.some((f) => (f ?? "").toLowerCase().includes(query));
}

export async function GET(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const url = new URL(request.url);
  const raw = (url.searchParams.get("q") ?? "").trim();
  const q = raw.toLowerCase();

  if (!q) {
    return Response.json({ query: raw, groups: [] });
  }

  const [leads, contacts, conversations, tasks, knowledge] = await Promise.all([
    listLeads(orgId),
    listContacts(orgId),
    listConversations(orgId),
    listTasks(orgId),
    listKnowledge(orgId),
  ]);

  const groups: SearchGroup[] = [];

  const leadItems: SearchResult[] = leads
    .filter((l) => matches(q, l.name, l.company, l.source, l.owner, l.stage))
    .slice(0, PER_GROUP)
    .map((l) => ({
      id: l.id,
      title: l.name,
      subtitle: [l.company, l.stage].filter(Boolean).join(" · ") || null,
      view: "leads",
    }));
  if (leadItems.length)
    groups.push({ key: "leads", label: "Leads", view: "leads", items: leadItems });

  const contactItems: SearchResult[] = contacts
    .filter((c) => matches(q, c.name, c.company, c.email, c.phone, c.type))
    .slice(0, PER_GROUP)
    .map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: [c.company, c.email].filter(Boolean).join(" · ") || null,
      view: "contacts",
    }));
  if (contactItems.length)
    groups.push({
      key: "contacts",
      label: "Contacts",
      view: "contacts",
      items: contactItems,
    });

  const convItems: SearchResult[] = conversations
    .filter((c) => matches(q, c.contact_name, c.subject, c.channel, c.status))
    .slice(0, PER_GROUP)
    .map((c) => ({
      id: c.id,
      title: c.subject || c.contact_name || "Conversation",
      subtitle:
        [c.contact_name, c.channel].filter(Boolean).join(" · ") || null,
      view: "inbox",
    }));
  if (convItems.length)
    groups.push({
      key: "conversations",
      label: "Conversations",
      view: "inbox",
      items: convItems,
    });

  const taskItems: SearchResult[] = tasks
    .filter((t) => matches(q, t.title, t.detail, t.assignee, t.status))
    .slice(0, PER_GROUP)
    .map((t) => ({
      id: t.id,
      title: t.title,
      subtitle:
        [t.assignee, t.status].filter(Boolean).join(" · ") || null,
      view: "tasks",
    }));
  if (taskItems.length)
    groups.push({ key: "tasks", label: "Tasks", view: "tasks", items: taskItems });

  const knowledgeItems: SearchResult[] = knowledge
    .filter((k) => matches(q, k.title, k.source, ...(k.tags ?? [])))
    .slice(0, PER_GROUP)
    .map((k) => ({
      id: k.id,
      title: k.title,
      subtitle: [k.source, k.status].filter(Boolean).join(" · ") || null,
      view: "knowledge",
    }));
  if (knowledgeItems.length)
    groups.push({
      key: "knowledge",
      label: "Knowledge",
      view: "knowledge",
      items: knowledgeItems,
    });

  return Response.json({ query: raw, groups });
}
