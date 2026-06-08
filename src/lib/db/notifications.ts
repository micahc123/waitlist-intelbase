// Data access for the in-app Notifications feed.
//
// Resilience contract: see src/lib/db/leads.ts. Demo notifications only in a
// demo context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own notifications, even when empty; query errors
// return the empty equivalent, not demo. Writes no-op gracefully (return
// { ok: false }) when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { demoNotifications } from "./demo";
import type { AppNotification, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listNotifications(
  orgId: string | null,
): Promise<AppNotification[]> {
  if (isDemoContext(orgId)) return demoNotifications();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as AppNotification[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function unreadCount(orgId: string | null): Promise<number> {
  const notifications = await listNotifications(orgId);
  return notifications.filter((n) => !n.read).length;
}

export async function markRead(
  orgId: string | null,
  id: string,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function markAllRead(orgId: string | null): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("org_id", orgId)
      .eq("read", false);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
