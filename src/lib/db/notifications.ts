// Data access for the in-app Notifications feed.
//
// Resilience contract: see src/lib/db/leads.ts. Notification lists fall back to
// demo when empty so the feed stays populated in the early product state.
// Writes no-op gracefully (return { ok: false }) when unconfigured and never
// throw.

import { createClient } from "@/lib/supabase/server";
import { demoNotifications } from "./demo";
import type { AppNotification, WriteResult } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function listNotifications(
  orgId: string | null,
): Promise<AppNotification[]> {
  if (!orgId || !configured()) return demoNotifications();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return demoNotifications();
    return data as AppNotification[];
  } catch {
    return demoNotifications();
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
  if (!orgId || !configured()) {
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
  if (!orgId || !configured()) {
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
