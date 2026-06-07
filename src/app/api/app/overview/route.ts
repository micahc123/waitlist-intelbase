// Overview dashboard data for the /app work shell.
//
// GET returns the honest metrics object plus the derived counts the Overview
// tiles need (open approvals, unread inbox, active leads, agent runs today) and
// the recent actions that power the activity feed (the audit trail). All values
// come from the resilient data layer in src/lib/db, which returns realistic DEMO
// data when Supabase is unconfigured or an org has no rows yet, so this endpoint
// is always populated.
//
// VERIFY AGAINST FORK: standard App Router route handler (named GET returning
// Response, force-dynamic). Confirmed against
// node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md.

import { getUserAndOrg } from "@/lib/auth";
import { getOverviewMetrics } from "@/lib/db/metrics";
import { listActions, pendingCount } from "@/lib/db/approvals";
import { leadStageCounts } from "@/lib/db/leads";
import { conversationCounts } from "@/lib/db/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const [metrics, pending, actions, stages, convCounts] = await Promise.all([
    getOverviewMetrics(orgId),
    pendingCount(orgId),
    listActions(orgId), // full audit trail, newest first
    leadStageCounts(orgId),
    conversationCounts(orgId),
  ]);

  // Active leads = anything still live in the pipeline (not won, not lost).
  const activeLeads = stages.new + stages.qualified + stages.booked;

  // Unread inbox = conversations needing a human eye (open + waiting).
  const unreadInbox = convCounts.open + convCounts.waiting;

  // Agent runs today = actions created in the last 24h (any status).
  const since = Date.now() - DAY_MS;
  const agentRunsToday = actions.filter(
    (a) => new Date(a.created_at).getTime() >= since,
  ).length;

  // The activity feed shows the most recent actions across all statuses.
  const recent = actions.slice(0, 12);

  return Response.json({
    metrics,
    counts: {
      openApprovals: pending,
      unreadInbox,
      activeLeads,
      bookings: metrics.bookings,
      agentRunsToday,
    },
    recent,
  });
}
