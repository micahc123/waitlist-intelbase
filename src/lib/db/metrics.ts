// Data access for the Overview / dashboard metrics.
//
// getOverviewMetrics computes real, honest numbers from the live tables for a
// real signed-in org, returning zeros when that org has no data yet (proper
// empty state). Demo metrics appear ONLY in a demo context (no org, the
// "demo-org" pass, or Supabase unconfigured). A genuine query error for a real
// org returns zeros, not demo.

import { createClient } from "@/lib/supabase/server";
import { demoMetrics } from "./demo";
import type { Conversation, Lead, OverviewMetrics } from "./types";
import { isDemoContext } from "./util";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function emptyMetrics(): OverviewMetrics {
  return {
    leadsThisWeek: 0,
    bookings: 0,
    responseTimeSeconds: 0,
    conversionRate: 0,
    messagesHandled: 0,
    pipelineValueCents: 0,
  };
}

export async function getOverviewMetrics(
  orgId: string | null,
): Promise<OverviewMetrics> {
  if (isDemoContext(orgId)) return demoMetrics();

  try {
    const supabase = await createClient();

    const [leadsRes, convRes] = await Promise.all([
      supabase.from("leads").select("*").eq("org_id", orgId),
      supabase.from("conversations").select("*").eq("org_id", orgId),
    ]);

    // Genuine error reading the real org -> honest zeros, never demo.
    if (leadsRes.error) return emptyMetrics();

    const leads = (leadsRes.data as Lead[] | null) ?? [];
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

    // Response time is not yet derivable from stored data. For a real org we
    // report 0 (honest empty) until turn timing is logged.
    const responseTimeSeconds = 0;

    return {
      leadsThisWeek,
      bookings,
      responseTimeSeconds,
      conversionRate,
      messagesHandled,
      pipelineValueCents,
    };
  } catch {
    return emptyMetrics();
  }
}
