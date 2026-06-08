// Data access for the Contacts / CRM surface.
//
// Resilience contract: see src/lib/db/leads.ts. Contact lists fall back to demo
// when there is no org, Supabase is unconfigured, the query errors, OR the
// table is empty, so the CRM stays populated in the early product state.

import { createClient } from "@/lib/supabase/server";
import { demoContacts } from "./demo";
import type { Contact, ContactType, ContactTypeCounts } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

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
  if (!orgId || !configured()) return demoContacts();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return demoContacts();
    return data as Contact[];
  } catch {
    return demoContacts();
  }
}

export async function getContact(
  orgId: string | null,
  id: string,
): Promise<Contact | null> {
  if (!orgId || !configured()) {
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
    if (error || !data) {
      return demoContacts().find((c) => c.id === id) ?? null;
    }
    return data as Contact;
  } catch {
    return demoContacts().find((c) => c.id === id) ?? null;
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
