// Data access for the Contacts / CRM surface.
//
// Resilience contract: see src/lib/db/leads.ts. Demo contacts only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own contacts, even when empty; query errors return the
// empty equivalent, not demo.

import { createClient } from "@/lib/supabase/server";
import { demoContacts } from "./demo";
import type { Contact, ContactType, ContactTypeCounts } from "./types";
import { isDemoContext } from "./util";

const ALL_TYPES: ContactType[] = [
  "customer",
  "vendor",
  "partner",
  "team",
  "lead",
];

function emptyTypeCounts(): ContactTypeCounts {
  return { customer: 0, vendor: 0, partner: 0, team: 0, lead: 0 };
}

export async function listContacts(orgId: string | null): Promise<Contact[]> {
  if (isDemoContext(orgId)) return demoContacts();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as Contact[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function getContact(
  orgId: string | null,
  id: string,
): Promise<Contact | null> {
  if (isDemoContext(orgId)) {
    return demoContacts().find((c) => c.id === id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as Contact;
  } catch {
    return null;
  }
}

export async function contactCounts(
  orgId: string | null,
): Promise<ContactTypeCounts> {
  const contacts = await listContacts(orgId);
  const counts = emptyTypeCounts();
  for (const c of contacts) {
    if (ALL_TYPES.includes(c.type)) counts[c.type] += 1;
  }
  return counts;
}
