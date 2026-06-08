// Data access for the Tasks board surface.
//
// Resilience contract: see src/lib/db/leads.ts. Demo tasks only in a demo
// context (no org, the "demo-org" pass, or Supabase unconfigured). A real
// signed-in org gets its own tasks, even when empty; query errors return the
// empty equivalent, not demo. Writes no-op gracefully (return { ok: false })
// when unconfigured and never throw.

import { createClient } from "@/lib/supabase/server";
import { demoTasks } from "./demo";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskStatusCounts,
  WriteResult,
} from "./types";
import { isDemoContext, supabaseConfigured } from "./util";

const ALL_STATUSES: TaskStatus[] = ["todo", "doing", "done"];

function emptyStatusCounts(): TaskStatusCounts {
  return { todo: 0, doing: 0, done: 0 };
}

export async function listTasks(orgId: string | null): Promise<Task[]> {
  if (isDemoContext(orgId)) return demoTasks();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as Task[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function taskCounts(
  orgId: string | null,
): Promise<TaskStatusCounts> {
  const tasks = await listTasks(orgId);
  const counts = emptyStatusCounts();
  for (const t of tasks) {
    if (ALL_STATUSES.includes(t.status)) counts[t.status] += 1;
  }
  return counts;
}

export async function updateTaskStatus(
  orgId: string | null,
  id: string,
  status: TaskStatus,
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("org_id", orgId)
      .eq("id", id);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

export async function createTask(
  orgId: string | null,
  payload: { title: string; priority?: TaskPriority; due_at?: string },
): Promise<WriteResult> {
  if (!orgId || !supabaseConfigured()) {
    return { ok: false, reason: "unconfigured" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tasks").insert({
      org_id: orgId,
      title: payload.title,
      priority: payload.priority ?? "med",
      due_at: payload.due_at ?? null,
      status: "todo",
      source: "human",
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}
