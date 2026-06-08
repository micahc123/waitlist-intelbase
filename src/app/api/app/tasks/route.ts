// Tasks board data API for the /app work shell.
//
// VERIFY AGAINST FORK: Standard App Router route handler conventions (named
// async `GET`/`POST` returning `Response`). This repo runs a modified Next.js
// fork whose docs live in node_modules/next/dist/docs/01-app/01-getting-started/
// 15-route-handlers.md; signature + `dynamic` checked against that doc.
//
// GET  -> { tasks, counts }                          (board cards + column counts)
// POST { op: "status", id, status }                  (move a task between columns)
// POST { op: "create", title, priority?, due_at? }   (add a new task)
//
// Thin wrapper: all logic lives in src/lib/db/tasks.ts. Reads fall back to
// deterministic DEMO data when Supabase is unconfigured or empty so the board
// stays populated with no keys; writes no-op gracefully (ok:false) when
// unconfigured, which the client treats as an optimistic, local-only change.
// Reads org via getUserAndOrg() (demo-org default).

import { getUserAndOrg } from "@/lib/auth";
import {
  createTask,
  listTasks,
  taskCounts,
  updateTaskStatus,
} from "@/lib/db/tasks";
import type { TaskPriority, TaskStatus } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: TaskStatus[] = ["todo", "doing", "done"];
const PRIORITIES: TaskPriority[] = ["low", "med", "high"];

export async function GET(): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  const [tasks, counts] = await Promise.all([
    listTasks(orgId),
    taskCounts(orgId),
  ]);
  return Response.json({ tasks, counts });
}

export async function POST(request: Request): Promise<Response> {
  const { org } = await getUserAndOrg();
  const orgId = org?.id ?? "demo-org";

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const op = body.op;

  if (op === "status") {
    const id = typeof body.id === "string" ? body.id : null;
    const status = body.status as TaskStatus;
    if (!id || !STATUSES.includes(status)) {
      return Response.json(
        { ok: false, reason: "invalid_input" },
        { status: 400 },
      );
    }
    const result = await updateTaskStatus(orgId, id, status);
    return Response.json(result);
  }

  if (op === "create") {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return Response.json(
        { ok: false, reason: "invalid_input" },
        { status: 400 },
      );
    }
    const priority = PRIORITIES.includes(body.priority as TaskPriority)
      ? (body.priority as TaskPriority)
      : "med";
    const due_at =
      typeof body.due_at === "string" && body.due_at ? body.due_at : undefined;
    const result = await createTask(orgId, { title, priority, due_at });
    return Response.json(result);
  }

  return Response.json({ ok: false, reason: "unknown_op" }, { status: 400 });
}
