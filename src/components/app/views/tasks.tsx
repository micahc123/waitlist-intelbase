// Tasks - the work board. A Kanban board (To do / Doing / Done) with a List
// toggle. Cards show the title, a priority chip, a due date (overdue rendered in
// danger), and an "agent" badge when source==='agent'. Status moves optimistically
// via a select (and quick-move buttons), persisting to POST /api/app/tasks
// {op:"status"}. An inline "New task" form (title + priority + due) POSTs
// {op:"create"}. Reads from /api/app/tasks, which serves deterministic DEMO data
// when Supabase is unconfigured so the board populates with no keys; writes no-op
// gracefully (the optimistic change stands so the demo stays interactive).

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  LayoutGrid,
  Rows3,
  Plus,
  Bot,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import type { Task, TaskPriority, TaskStatus } from "@/lib/db/types";
import "./tasks.css";

const COLUMNS: Array<{ key: TaskStatus; label: string; accent: string }> = [
  { key: "todo", label: "To do", accent: "var(--ib-text-3)" },
  { key: "doing", label: "Doing", accent: "var(--ib-blue)" },
  { key: "done", label: "Done", accent: "var(--ib-mint)" },
];

const PRIORITY_META: Record<TaskPriority, { label: string; chip: string }> = {
  high: { label: "High", chip: "ibx-chip-danger" },
  med: { label: "Med", chip: "ibx-chip-warning" },
  low: { label: "Low", chip: "ibx-chip-info" },
};

const PRIORITIES: TaskPriority[] = ["high", "med", "low"];

function dueMeta(iso: string | null): { label: string; overdue: boolean } | null {
  if (!iso) return null;
  const ts = new Date(iso).getTime();
  const diff = ts - Date.now();
  const overdue = diff < 0;
  const absHr = Math.round(Math.abs(diff) / 3600000);
  let label: string;
  if (absHr < 1) label = overdue ? "just overdue" : "due <1h";
  else if (absHr < 24) label = overdue ? `${absHr}h overdue` : `due ${absHr}h`;
  else {
    const d = Math.round(absHr / 24);
    label = overdue ? `${d}d overdue` : `due ${d}d`;
  }
  return { label, overdue };
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [layout, setLayout] = useState<"board" | "list">("board");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/app/tasks")
      .then((r) => r.json())
      .then((data: { tasks: Task[] }) => {
        if (active) setTasks(data.tasks ?? []);
      })
      .catch(() => {
        if (active) setTasks([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const move = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === id ? { ...t, status } : t)) : prev,
    );
    fetch("/api/app/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "status", id, status }),
    }).catch(() => {
      /* keep optimistic move; demo / offline tolerant */
    });
  }, []);

  const addTask = useCallback(
    (title: string, priority: TaskPriority, due: string) => {
      const due_at = due ? new Date(due).toISOString() : null;
      const optimistic: Task = {
        id: `local-${Date.now()}`,
        org_id: "demo-org",
        title,
        detail: null,
        status: "todo",
        priority,
        due_at,
        assignee: "You",
        source: "human",
        agent_id: null,
        created_at: new Date().toISOString(),
      };
      setTasks((prev) => (prev ? [optimistic, ...prev] : [optimistic]));
      setAdding(false);
      fetch("/api/app/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "create",
          title,
          priority,
          due_at: due_at ?? undefined,
        }),
      }).catch(() => {
        /* keep optimistic add */
      });
    },
    [],
  );

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
    (tasks ?? []).forEach((t) => map[t.status]?.push(t));
    return map;
  }, [tasks]);

  return (
    <div className="ibx tasks">
      <ViewHead
        title="Tasks"
        subtitle="Everything that needs doing - yours and the work your agents queue for sign-off - on one board."
      />

      <div className="tasks-bar">
        <div className="tasks-layout-toggle" role="group" aria-label="Layout">
          <button
            type="button"
            className={`tasks-seg${layout === "board" ? " is-active" : ""}`}
            onClick={() => setLayout("board")}
            aria-pressed={layout === "board"}
          >
            <LayoutGrid size={15} />
            Board
          </button>
          <button
            type="button"
            className={`tasks-seg${layout === "list" ? " is-active" : ""}`}
            onClick={() => setLayout("list")}
            aria-pressed={layout === "list"}
          >
            <Rows3 size={15} />
            List
          </button>
        </div>
        <button
          type="button"
          className="ibx-btn ibx-btn-primary"
          onClick={() => setAdding((a) => !a)}
          aria-expanded={adding}
        >
          <Plus size={15} />
          New task
        </button>
      </div>

      {adding && <NewTaskForm onAdd={addTask} onCancel={() => setAdding(false)} />}

      {layout === "board" ? (
        <div className="tasks-board">
          {COLUMNS.map((col) => (
            <section key={col.key} className="tasks-col" aria-label={col.label}>
              <header className="tasks-col-head">
                <span
                  className="tasks-col-dot"
                  style={{ background: col.accent }}
                  aria-hidden="true"
                />
                <span className="tasks-col-title">{col.label}</span>
                <span className="tasks-col-count">
                  {tasks === null ? "--" : byStatus[col.key].length}
                </span>
              </header>
              <div className="tasks-col-body">
                {tasks === null &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="tasks-card-skel" aria-hidden="true" />
                  ))}
                {tasks !== null &&
                  byStatus[col.key].map((t) => (
                    <TaskCard key={t.id} task={t} onMove={move} />
                  ))}
                {tasks !== null && byStatus[col.key].length === 0 && (
                  <div className="tasks-col-empty">Nothing here</div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <TaskList tasks={tasks} onMove={move} />
      )}
    </div>
  );
}

function TaskCard({
  task,
  onMove,
}: {
  task: Task;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  const prio = PRIORITY_META[task.priority];
  const due = dueMeta(task.due_at);
  const idx = COLUMNS.findIndex((c) => c.key === task.status);
  const prev = idx > 0 ? COLUMNS[idx - 1] : null;
  const next = idx < COLUMNS.length - 1 ? COLUMNS[idx + 1] : null;

  return (
    <article className="tasks-card">
      <div className="tasks-card-top">
        <span className={`ibx-chip ${prio.chip}`}>
          <span className="ibx-chip-dot" />
          {prio.label}
        </span>
        {task.source === "agent" && (
          <span className="tasks-agent-badge" title={`Queued by ${task.agent_id ?? "agent"}`}>
            <Bot size={12} />
            {task.agent_id ?? "agent"}
          </span>
        )}
      </div>
      <div className="tasks-card-title">{task.title}</div>
      <div className="tasks-card-foot">
        {due ? (
          <span className={`tasks-due${due.overdue ? " is-overdue" : ""}`}>
            <CalendarClock size={12} />
            {due.label}
          </span>
        ) : (
          <span className="tasks-due is-none">no due date</span>
        )}
        <div className="tasks-card-moves">
          {prev && (
            <button
              type="button"
              className="tasks-move-btn"
              onClick={() => onMove(task.id, prev.key)}
              aria-label={`Move to ${prev.label}`}
              title={`Move to ${prev.label}`}
            >
              <ArrowLeft size={14} />
            </button>
          )}
          {next && (
            <button
              type="button"
              className="tasks-move-btn"
              onClick={() => onMove(task.id, next.key)}
              aria-label={`Move to ${next.label}`}
              title={`Move to ${next.label}`}
            >
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function TaskList({
  tasks,
  onMove,
}: {
  tasks: Task[] | null;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  return (
    <div className="ibx-panel" style={{ overflow: "hidden" }}>
      <div className="tasks-list-wrap">
        <table className="ibx-table tasks-list">
          <thead>
            <tr>
              <th scope="col">Task</th>
              <th scope="col">Priority</th>
              <th scope="col">Source</th>
              <th scope="col">Due</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks === null &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} aria-hidden="true">
                  <td colSpan={5}>
                    <div className="tasks-card-skel" style={{ height: 16 }} />
                  </td>
                </tr>
              ))}
            {tasks !== null &&
              tasks.map((t) => {
                const prio = PRIORITY_META[t.priority];
                const due = dueMeta(t.due_at);
                return (
                  <tr key={t.id}>
                    <td>
                      <span className="tasks-list-title">{t.title}</span>
                    </td>
                    <td>
                      <span className={`ibx-chip ${prio.chip}`}>
                        <span className="ibx-chip-dot" />
                        {prio.label}
                      </span>
                    </td>
                    <td>
                      {t.source === "agent" ? (
                        <span className="tasks-agent-badge">
                          <Bot size={12} />
                          {t.agent_id ?? "agent"}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ib-text-3)" }}>You</span>
                      )}
                    </td>
                    <td>
                      {due ? (
                        <span
                          className={`tasks-due${due.overdue ? " is-overdue" : ""}`}
                        >
                          {due.label}
                        </span>
                      ) : (
                        <span style={{ color: "var(--ib-text-4)" }}>--</span>
                      )}
                    </td>
                    <td>
                      <select
                        className={`tasks-status-select status-${t.status}`}
                        value={t.status}
                        onChange={(e) =>
                          onMove(t.id, e.target.value as TaskStatus)
                        }
                        aria-label={`Status for ${t.title}`}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            {tasks !== null && tasks.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="ibx-empty">
                    <div className="ibx-empty-icon">
                      <ListChecks size={22} />
                    </div>
                    <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                      No tasks yet
                    </div>
                    <div style={{ maxWidth: "38ch" }}>
                      Work you and your agents need to do shows up here. Add one
                      with New task.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewTaskForm({
  onAdd,
  onCancel,
}: {
  onAdd: (title: string, priority: TaskPriority, due: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [due, setDue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority, due);
    setTitle("");
    setDue("");
    setPriority("med");
  };

  return (
    <form className="ibx-panel tasks-new" onSubmit={submit}>
      <input
        className="ibx-input tasks-new-title"
        type="text"
        placeholder="What needs doing?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Task title"
        autoFocus
      />
      <select
        className="ibx-input tasks-new-prio"
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        aria-label="Priority"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_META[p].label}
          </option>
        ))}
      </select>
      <input
        className="ibx-input tasks-new-due"
        type="date"
        value={due}
        onChange={(e) => setDue(e.target.value)}
        aria-label="Due date"
      />
      <button type="submit" className="ibx-btn ibx-btn-primary" disabled={!title.trim()}>
        Add
      </button>
      <button type="button" className="ibx-btn ibx-btn-ghost" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
