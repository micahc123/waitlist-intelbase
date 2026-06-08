// Contacts / CRM data API for the /app work shell.
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET` returning `Response`). This repo runs a modified Next.js fork
// whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET -> { contacts, counts }   (table rows + type-count pills)
//
// Thin wrapper: all logic lives in src/lib/db/contacts.ts. Reads fall back to
// deterministic DEMO data when Supabase is unconfigured or empty so the CRM
// stays populated with no keys. Reads org via getUserAndOrg() (demo-org default).

import { getUserAndOrg } from "@/lib/auth";
import { contactCounts, listContacts } from "@/lib/db/contacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const [contacts, counts] = await Promise.all([
    listContacts(orgId),
    contactCounts(orgId),
  ]);
  return Response.json({ contacts, counts });
}
