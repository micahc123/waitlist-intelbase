// Data access for the Automations / workflow rules surface.
//
// Resilience contract: see src/lib/db/leads.ts. Demo automations only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own automations, even when empty; query errors return
// the empty equivalent, not demo. Writes no-op gracefully (return
// { ok: false }) when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTask } from "./tasks";
import { demoAutomations } from "./demo";
import type { Automation, WriteResult } from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

export async function listAutomations(
  orgId: string | null,
): Promise<Automation[]> {
  if (isDemoContext(orgId)) return demoAutomations();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as Automation[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function toggleAutomation(
  orgId: string | null,
  id: string,
  enabled: boolean,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("automations")
      .update({ enabled })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function createAutomation(
  orgId: string | null,
  payload: {
    name: string;
    trigger?: Record<string, unknown>;
    steps?: Array<Record<string, unknown>>;
    enabled?: boolean;
  },
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("automations").insert({
      org_id: orgId,
      name: payload.name,
      trigger: payload.trigger ?? {},
      steps: payload.steps ?? [],
      enabled: payload.enabled ?? true,
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function deleteAutomation(
  orgId: string | null,
  id: string,
): Promise<WriteResult> {
  // Demo context (no real org / unconfigured) is a graceful no-op so the
  // optimistic client-side removal stands without touching the DB.
  if (isDemoContext(orgId)) return { ok: true };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("automations")
      .delete()
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

// ---------------------------------------------------------------------------
// runAutomation - actually EXECUTE a rule's steps and produce real artifacts.
//
// Each step is mapped to a concrete write so the user sees something happen:
//   create_task                       -> a Task on the board
//   send_email / draft_reply /
//     follow_up / send_followup /
//     request_review                  -> a PENDING action in Approvals (the
//                                        automation proposes; a human approves)
//   book_call                         -> a PENDING action (type "book_call")
//   notify / post_to_team             -> a notification row
//   default / unknown                 -> a notification "Automation ran: <name>"
//
// After running every step we bump runs + last_run_at and drop ONE summary
// notification. Demo context returns a simulated result without writing.
// Resilient by contract: never throws; a failed individual write is counted but
// does not abort the run.
// ---------------------------------------------------------------------------
export async function runAutomation(
  orgId: string | null,
  automationId: string,
): Promise<{
  ok: boolean;
  demo?: boolean;
  reason?: string;
  produced?: {
    tasks: number;
    actions: number;
    notifications: number;
    total: number;
  };
}> {
  if (isDemoContext(orgId)) {
    // Simulated run for the public demo pass - no DB writes.
    return { ok: true, demo: true };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, reason: "unconfigured" };

  try {
    const { data: automation, error: loadError } = await admin
      .from("automations")
      .select("*")
      .eq("org_id", orgId)
      .eq("id", automationId)
      .maybeSingle();

    if (loadError) return { ok: false, reason: loadError.message };
    if (!automation) return { ok: false, reason: "not_found" };

    const rule = automation as Automation;
    const steps = Array.isArray(rule.steps) ? rule.steps : [];

    let tasks = 0;
    let actions = 0;
    let notifications = 0;

    const insertAction = async (
      type: string,
      summary: string,
      detail: Record<string, unknown>,
      agentId: string,
    ) => {
      const { error } = await admin.from("actions").insert({
        org_id: orgId,
        agent_id: agentId,
        type,
        summary,
        detail,
        status: "pending",
      });
      if (!error) actions += 1;
    };

    const insertNotification = async (title: string, body: string) => {
      const { error } = await admin.from("notifications").insert({
        org_id: orgId,
        kind: "agent",
        title,
        body,
        read: false,
        link: "automations",
      });
      if (!error) notifications += 1;
    };

    for (const step of steps) {
      const type = String(step.type ?? "");
      const agentId = typeof step.agent === "string" ? step.agent : "ops";
      const summary =
        typeof step.summary === "string"
          ? step.summary
          : `Automation step: ${type || "unknown"}`;

      switch (type) {
        case "create_task": {
          const title =
            typeof step.title === "string" ? step.title : "Automation task";
          const res = await createTask(orgId, { title, priority: "med" });
          if (res.ok) tasks += 1;
          break;
        }
        case "send_email":
        case "draft_reply":
        case "follow_up":
        case "send_followup":
        case "request_review": {
          await insertAction(type, summary, step, agentId);
          break;
        }
        case "book_call": {
          await insertAction("book_call", summary, step, agentId);
          break;
        }
        case "notify":
        case "post_to_team": {
          await insertNotification(
            "Automation step",
            typeof step.summary === "string"
              ? step.summary
              : `${rule.name}: ${type}`,
          );
          break;
        }
        default: {
          await insertNotification("Automation ran", rule.name);
          break;
        }
      }
    }

    // Bump run count + last run timestamp.
    await admin
      .from("automations")
      .update({
        runs: (rule.runs ?? 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq("org_id", orgId)
      .eq("id", automationId);

    // One summary notification for the whole run.
    await admin.from("notifications").insert({
      org_id: orgId,
      kind: "agent",
      title: "Automation ran",
      body: `${rule.name} ran ${steps.length} step${steps.length === 1 ? "" : "s"}`,
      read: false,
      link: "automations",
    });
    notifications += 1;

    const total = tasks + actions + notifications;
    return { ok: true, produced: { tasks, actions, notifications, total } };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
