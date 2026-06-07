// Inbox data API for the /app work shell (unified conversations).
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET` returning `Response`). This repo runs a modified Next.js fork
// whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET                -> { conversations, counts }  (the inbox list + header tallies)
// GET ?id=conv-001   -> { conversation }           (one thread with its messages)
//
// Thin wrapper: all logic lives in src/lib/db/conversations.ts, which falls back
// to deterministic DEMO data when Supabase is unconfigured or empty, so the inbox
// stays populated with no keys. Reads org via getUserAndOrg() (demo-org default).

import { getUserAndOrg } from "@/lib/auth";
import {
  conversationCounts,
  getConversation,
  listConversations,
} from "@/lib/db/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    const conversation = await getConversation(orgId, id);
    if (!conversation) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    return Response.json({ conversation });
  }

  const [conversations, counts] = await Promise.all([
    listConversations(orgId),
    conversationCounts(orgId),
  ]);
  return Response.json({ conversations, counts });
}
