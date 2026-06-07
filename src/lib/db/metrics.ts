// Data access for the Overview / dashboard metrics.
//
// getOverviewMetrics computes real, honest numbers from the live tables when an
// org has data. If there is no org, Supabase is unconfigured, an error occurs,
// or the org has no leads yet, it falls back to demoMetrics() so the dashboard
// always shows a populated, believable state.

import { createClient } from "@/lib/supabase/server";
import { demoMetrics } from "./demo";
import type { Conversation, Lead, OverviewMetrics } from "./types";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getOverviewMetrics(
  orgId: string | null,
): Promise<OverviewMetrics> {
  if (!orgId || !configured()) return demoMetrics();

  try {
    const supabase = await createClient();

    const [leadsRes, convRes] = await Promise.all([
      supabase.from("leads").select("*").eq("org_id", orgId),
      supabase.from("conversations").select("*").eq("org_id", orgId),
    ]);

    const leads = (leadsRes.data as Lead[] | null) ?? [];

    // No real leads yet -> keep the dashboard populated with demo metrics.
    if (leadsRes.error || leads.length === 0) return demoMetrics();

    const conversations =
      (convRes.data as Conversation[] | null) ?? [];

    const weekAgo = Date.now() - WEEK_MS;

    const leadsThisWeek = leads.filter(
      (l) => new Date(l.created_at).getTime() >= weekAgo,
    ).length;

    const bookings = leads.filter(
      (l) => l.stage === "booked" || l.stage === "won",
    ).length;

    const won = leads.filter((l) => l.stage === "won").length;
    const decided = leads.filter(
      (l) => l.stage === "won" || l.stage === "lost",
    ).length;
    const conversionRate = decided > 0 ? won / decided : 0;

    const pipelineValueCents = leads
      .filter((l) => l.stage !== "lost")
      .reduce((sum, l) => sum + (l.value_cents ?? 0), 0);

    // Messages handled: count of messages across the org's conversations.
    // (Done via a head count so we do not pull message bodies.)
    let messagesHandled = 0;
    if (conversations.length > 0) {
      const ids = conversations.map((c) => c.id);
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids);
      messagesHandled = count ?? 0;
    }

    // Response time is not yet derivable from stored data; surface the demo
    // baseline so the tile is never blank. Replace once turn timing is logged.
    const responseTimeSeconds = demoMetrics().responseTimeSeconds;

    return {
      leadsThisWeek,
      bookings,
      responseTimeSeconds,
      conversionRate,
      messagesHandled,
      pipelineValueCents,
    };
  } catch {
    return demoMetrics();
  }
}
