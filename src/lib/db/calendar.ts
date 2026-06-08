// Data access for the Calendar surface (calendar_events table).
//
// Resilience contract: see src/lib/db/leads.ts. Demo events only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own events, even when empty; query errors return the
// empty equivalent, not demo.

import { createClient } from "@/lib/supabase/server";
import { demoCalendar } from "./demo";
import type { CalendarEvent } from "./types";
import { isDemoContext } from "./util";

// Filter a demo set to a [from, to] window (used as the demo result for the
// same range applied to a Supabase query in a demo context).
function withinRange(
  events: CalendarEvent[],
  from?: string,
  to?: string,
): CalendarEvent[] {
  return events.filter((e) => {
    if (from && e.start_at < from) return false;
    if (to && e.start_at > to) return false;
    return true;
  });
}

export async function listEvents(
  orgId: string | null,
  opts: { from?: string; to?: string } = {},
): Promise<CalendarEvent[]> {
  const { from, to } = opts;

  if (isDemoContext(orgId)) {
    return withinRange(demoCalendar(), from, to);
  }
  try {
    const supabase = await createClient();
    let query = supabase
      .from("calendar_events")
      .select("*")
      .eq("org_id", orgId)
      .order("start_at", { ascending: true });
    if (from) query = query.gte("start_at", from);
    if (to) query = query.lte("start_at", to);

    const { data, error } = await query;
    if (error) return [];
    return (data as CalendarEvent[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function upcomingEvents(
  orgId: string | null,
  limit: number,
): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();

  if (isDemoContext(orgId)) {
    return demoCalendar()
      .filter((e) => e.start_at >= now && e.status !== "cancelled")
      .sort((a, b) => (a.start_at < b.start_at ? -1 : 1))
      .slice(0, limit);
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("org_id", orgId)
      .neq("status", "cancelled")
      .gte("start_at", now)
      .order("start_at", { ascending: true })
      .limit(limit);
    if (error) return [];
    return (data as CalendarEvent[] | null) ?? [];
  } catch {
    return [];
  }
}
