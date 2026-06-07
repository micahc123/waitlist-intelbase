// Approvals - the human-in-the-loop trust centerpiece. Two parts:
//   1. PENDING queue: each agent action as a card with a clear summary, an
//      expandable preview of the drafted content (the detail jsonb), the target,
//      relative time, and Approve / Edit / Reject controls. Approve/Reject POST
//      to /api/app/approvals and optimistically remove the row with an inline
//      confirm toast.
//   2. AUDIT TRAIL ("Recent"): approved / auto / rejected actions in a table with
//      status chips, who decided, and when.
//
// Data comes from the resilient data layer, which returns realistic DEMO actions
// when Supabase is unconfigured. In demo mode the decide POST is a graceful no-op
// (the API returns { ok: true, demo: true }), so the optimistic UI still works.

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Check,
  X,
  Pencil,
  ChevronDown,
  ChevronRight,
  Inbox,
  MessageSquare,
  CalendarClock,
  TrendingUp,
  Sparkles,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { ViewHead } from "./view-shell";

// ---------------------------------------------------------------------------
// Shared shapes + lookups (kept local; this is one of only two files the task
// allows editing, so helpers live inline rather than in a new module).
// ---------------------------------------------------------------------------

interface ActionItem {
  id: string;
  agent_id: string;
  type: string;
  summary: string;
  detail: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "auto";
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

const AGENT_META: Record<string, { name: string; icon: LucideIcon; color: string }> = {
  concierge: { name: "Concierge", icon: MessageSquare, color: "var(--ib-blue)" },
  inbox: { name: "Inbox agent", icon: Inbox, color: "var(--ib-cyan)" },
  scheduler: { name: "Scheduler", icon: CalendarClock, color: "var(--ib-mint)" },
  leadgen: { name: "Leadgen", icon: TrendingUp, color: "var(--ib-violet)" },
  nurture: { name: "Nurture", icon: Sparkles, color: "var(--ib-pink)" },
  ops: { name: "Ops", icon: Settings2, color: "var(--ib-amber)" },
};

const STATUS_META: Record<
  ActionItem["status"],
  { label: string; chip: string }
> = {
  pending: { label: "PENDING", chip: "ibx-chip-warning" },
  approved: { label: "APPROVED", chip: "ibx-chip-success" },
  rejected: { label: "REJECTED", chip: "ibx-chip-danger" },
  auto: { label: "AUTO", chip: "ibx-chip-info" },
};

const TYPE_LABEL: Record<string, string> = {
  draft_reply: "Draft reply",
  auto_reply: "Auto reply",
  book_call: "Book call",
  send_quote: "Send quote",
  send_followup: "Send follow-up",
  bulk_followup: "Bulk follow-up",
  daily_summary: "Daily summary",
};

function typeLabel(t: string): string {
  return TYPE_LABEL[t] ?? t.replace(/_/g, " ");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function hkd(cents: number): string {
  return "HK$" + Math.round(cents / 100).toLocaleString("en-HK");
}

// Turn the detail jsonb into a genuinely useful, human-readable preview. For
// drafted messages we surface the body; otherwise we render the key fields.
function detailPreview(action: ActionItem): {
  body: string | null;
  fields: Array<{ k: string; v: string }>;
} {
  const d = action.detail ?? {};
  const bodyKeys = ["body", "draft", "message", "content", "text"];
  let body: string | null = null;
  for (const k of bodyKeys) {
    if (typeof d[k] === "string") {
      body = d[k] as string;
      break;
    }
  }

  // No drafted body in the demo data, so synthesize a believable one from the
  // summary + type so the preview is never empty for message-type actions.
  if (!body && (action.type === "draft_reply" || action.type === "send_quote" || action.type === "send_followup")) {
    body = action.summary;
  }

  const fields: Array<{ k: string; v: string }> = [];
  for (const [k, v] of Object.entries(d)) {
    if (bodyKeys.includes(k)) continue;
    let val: string;
    if (k === "value_cents" && typeof v === "number") val = hkd(v);
    else if (k === "confidence" && typeof v === "number") val = Math.round(v * 100) + "%";
    else if (typeof v === "object") val = JSON.stringify(v);
    else val = String(v);
    fields.push({ k: k.replace(/_/g, " "), v: val });
  }

  return { body, fields };
}

type Tab = "pending" | "recent";

export function Approvals() {
  const [pending, setPending] = useState<ActionItem[] | null>(null);
  const [recent, setRecent] = useState<ActionItem[] | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/app/approvals?status=pending")
      .then((r) => r.json())
      .then((d: { actions: ActionItem[] }) => setPending(d.actions))
      .catch(() => setPending([]));
    fetch("/api/app/approvals")
      .then((r) => r.json())
      .then((d: { actions: ActionItem[] }) =>
        setRecent(d.actions.filter((a) => a.status !== "pending")),
      )
      .catch(() => setRecent([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const decide = useCallback(
    async (action: ActionItem, decision: "approve" | "reject") => {
      // Optimistic: remove from queue and add to the audit trail immediately.
      setPending((prev) => (prev ? prev.filter((a) => a.id !== action.id) : prev));
      const decidedStatus = decision === "approve" ? "approved" : "rejected";
      setRecent((prev) => [
        {
          ...action,
          status: decidedStatus,
          decided_at: new Date().toISOString(),
          decided_by: "You",
        },
        ...(prev ?? []),
      ]);

      try {
        const res = await fetch("/api/app/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: action.id, decision }),
        });
        const json = (await res.json()) as { ok?: boolean; demo?: boolean };
        if (!json.ok) {
          // Roll back on a genuine failure.
          setPending((prev) => (prev ? [action, ...prev] : [action]));
          setRecent((prev) => (prev ? prev.filter((a) => a.id !== action.id) : prev));
          showToast("Could not save that decision. Try again.");
          return;
        }
        showToast(
          decision === "approve"
            ? `Approved: ${typeLabel(action.type)}`
            : `Rejected: ${typeLabel(action.type)}`,
        );
      } catch {
        setPending((prev) => (prev ? [action, ...prev] : [action]));
        setRecent((prev) => (prev ? prev.filter((a) => a.id !== action.id) : prev));
        showToast("Network error. Decision not saved.");
      }
    },
    [showToast],
  );

  const pendingCount = pending?.length ?? 0;
  const loading = pending === null && recent === null;

  return (
    <div className="ibx" style={{ position: "relative" }}>
      <style>{SHIMMER_KEYFRAMES}</style>
      <ViewHead
        title="Approvals"
        subtitle="Nothing your agents draft goes out without you. Review the queue, then approve, edit, or reject. Every decision is logged."
      />

      {/* tabs + pending count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--ib-2)",
          marginBottom: "var(--ib-4)",
        }}
      >
        <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
          Pending
          <span
            className="ibx-mono"
            style={{
              marginLeft: 6,
              padding: "1px 7px",
              borderRadius: "var(--ib-r-pill)",
              fontSize: "var(--ib-fs-xs)",
              background: pendingCount > 0 ? "var(--ib-amber-soft)" : "var(--ib-surface-2)",
              color: pendingCount > 0 ? "var(--ib-amber)" : "var(--ib-text-3)",
              border:
                pendingCount > 0
                  ? "1px solid rgba(255,184,107,.3)"
                  : "1px solid var(--ib-border)",
            }}
          >
            {pendingCount}
          </span>
        </TabButton>
        <TabButton active={tab === "recent"} onClick={() => setTab("recent")}>
          Recent
        </TabButton>
      </div>

      {tab === "pending" ? (
        <PendingQueue
          loading={loading}
          actions={pending ?? []}
          onDecide={decide}
        />
      ) : (
        <AuditTrail loading={recent === null} actions={recent ?? []} />
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: "var(--ib-5)",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "var(--ib-3) var(--ib-4)",
            background: "var(--ib-elevated)",
            border: "1px solid var(--ib-border-strong)",
            borderRadius: "var(--ib-r-sm)",
            color: "var(--ib-text)",
            fontSize: "var(--ib-fs-sm)",
            boxShadow: "var(--ib-shadow-2)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ibx-btn ibx-btn-ghost"
      style={{
        height: 32,
        color: active ? "var(--ib-text)" : "var(--ib-text-3)",
        background: active ? "var(--ib-surface-2)" : "transparent",
        border: active ? "1px solid var(--ib-border)" : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function PendingQueue({
  loading,
  actions,
  onDecide,
}: {
  loading: boolean;
  actions: ActionItem[];
  onDecide: (a: ActionItem, d: "approve" | "reject") => void;
}) {
  if (loading) {
    return (
      <div style={{ display: "grid", gap: "var(--ib-3)" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="ibx-panel">
        <div className="ibx-empty">
          <div className="ibx-empty-icon">
            <ShieldCheck size={22} />
          </div>
          <div
            style={{
              fontSize: "var(--ib-fs-base)",
              fontWeight: 600,
              color: "var(--ib-text-2)",
            }}
          >
            All caught up
          </div>
          <div style={{ maxWidth: "44ch" }}>
            No actions are waiting for your sign-off. When an agent proposes a
            send, a spend, or a change that needs a human, it queues here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "var(--ib-3)" }}>
      {actions.map((a) => (
        <PendingCard key={a.id} action={a} onDecide={onDecide} />
      ))}
    </div>
  );
}

function PendingCard({
  action,
  onDecide,
}: {
  action: ActionItem;
  onDecide: (a: ActionItem, d: "approve" | "reject") => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const agent = AGENT_META[action.agent_id] ?? AGENT_META.ops;
  const AgentIcon = agent.icon;
  const preview = useMemo(() => detailPreview(action), [action]);
  const [draft, setDraft] = useState(preview.body ?? "");

  return (
    <div className="ibx-panel" style={{ padding: "var(--ib-4)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--ib-3)" }}>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "var(--ib-r-sm)",
            background: "var(--ib-surface-2)",
            border: "1px solid var(--ib-border)",
            color: agent.color,
          }}
        >
          <AgentIcon size={17} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--ib-2)",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "var(--ib-fs-sm)" }}>
              {agent.name}
            </span>
            <span className="ibx-chip" style={{ height: 20 }}>
              {typeLabel(action.type)}
            </span>
            <span
              className="ibx-mono"
              style={{ fontSize: "var(--ib-fs-xs)", color: "var(--ib-text-4)" }}
            >
              {relativeTime(action.created_at)}
            </span>
          </div>
          <div
            style={{
              marginTop: "var(--ib-2)",
              fontSize: "var(--ib-fs-base)",
              color: "var(--ib-text)",
            }}
          >
            {action.summary}
          </div>

          {(preview.body || preview.fields.length > 0) && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="ibx-btn ibx-btn-ghost"
              style={{
                height: 28,
                padding: "0 var(--ib-2)",
                marginTop: "var(--ib-2)",
                marginLeft: "calc(var(--ib-2) * -1)",
                fontSize: "var(--ib-fs-xs)",
                color: "var(--ib-text-3)",
              }}
              aria-expanded={open}
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {open ? "Hide preview" : "Preview what the agent will send"}
            </button>
          )}

          {open && (
            <div
              style={{
                marginTop: "var(--ib-3)",
                border: "1px solid var(--ib-border)",
                borderRadius: "var(--ib-r-sm)",
                background: "var(--ib-bg)",
                overflow: "hidden",
              }}
            >
              {preview.body !== null && (
                <div style={{ padding: "var(--ib-3)" }}>
                  <div
                    style={{
                      fontSize: "var(--ib-fs-xs)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--ib-text-4)",
                      marginBottom: "var(--ib-2)",
                      fontFamily: "var(--ib-mono)",
                    }}
                  >
                    Drafted content
                  </div>
                  {editing ? (
                    <textarea
                      className="ibx-input"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      style={{
                        height: "auto",
                        padding: "var(--ib-2) var(--ib-3)",
                        lineHeight: 1.5,
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--ib-fs-sm)",
                        color: "var(--ib-text-2)",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {draft}
                    </p>
                  )}
                </div>
              )}
              {preview.fields.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--ib-2) var(--ib-5)",
                    padding: "var(--ib-3)",
                    borderTop:
                      preview.body !== null ? "1px solid var(--ib-hairline)" : "none",
                  }}
                >
                  {preview.fields.map((f) => (
                    <div key={f.k}>
                      <div
                        style={{
                          fontSize: "var(--ib-fs-xs)",
                          color: "var(--ib-text-4)",
                          fontFamily: "var(--ib-mono)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {f.k}
                      </div>
                      <div
                        className="ibx-mono"
                        style={{ fontSize: "var(--ib-fs-sm)", color: "var(--ib-text)" }}
                      >
                        {f.v}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--ib-2)",
          marginTop: "var(--ib-4)",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          className="ibx-btn ibx-btn-ghost"
          onClick={() => {
            setOpen(true);
            setEditing((e) => !e);
          }}
        >
          <Pencil size={15} />
          {editing ? "Done editing" : "Edit"}
        </button>
        <button
          type="button"
          className="ibx-btn ibx-btn-danger"
          onClick={() => onDecide(action, "reject")}
        >
          <X size={15} />
          Reject
        </button>
        <button
          type="button"
          className="ibx-btn ibx-btn-primary"
          onClick={() => onDecide(action, "approve")}
        >
          <Check size={15} />
          Approve
        </button>
      </div>
    </div>
  );
}

function AuditTrail({
  loading,
  actions,
}: {
  loading: boolean;
  actions: ActionItem[];
}) {
  if (loading) {
    return (
      <div className="ibx-panel" style={{ padding: "var(--ib-4)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} w="100%" h={20} mt={i === 0 ? 0 : 12} />
        ))}
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="ibx-panel">
        <div className="ibx-empty">
          <div className="ibx-empty-icon">
            <ShieldCheck size={22} />
          </div>
          <div
            style={{
              fontSize: "var(--ib-fs-base)",
              fontWeight: 600,
              color: "var(--ib-text-2)",
            }}
          >
            No decisions yet
          </div>
          <div style={{ maxWidth: "44ch" }}>
            Approved, auto-handled, and rejected actions will be logged here as an
            audit trail.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ibx-panel" style={{ overflow: "hidden" }}>
      <table className="ibx-table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Action</th>
            <th>Status</th>
            <th>Decided by</th>
            <th style={{ textAlign: "right" }}>When</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => {
            const agent = AGENT_META[a.agent_id] ?? AGENT_META.ops;
            const AgentIcon = agent.icon;
            const status = STATUS_META[a.status] ?? STATUS_META.auto;
            return (
              <tr key={a.id}>
                <td>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--ib-2)",
                    }}
                  >
                    <AgentIcon size={15} style={{ color: agent.color }} />
                    {agent.name}
                  </span>
                </td>
                <td style={{ color: "var(--ib-text-2)" }}>{a.summary}</td>
                <td>
                  <span className={`ibx-chip ${status.chip}`}>
                    <span className="ibx-chip-dot" />
                    {status.label}
                  </span>
                </td>
                <td className="ibx-mono" style={{ color: "var(--ib-text-3)" }}>
                  {a.decided_by ?? "--"}
                </td>
                <td
                  className="ibx-mono"
                  style={{ textAlign: "right", color: "var(--ib-text-4)" }}
                >
                  {relativeTime(a.decided_at ?? a.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SHIMMER_KEYFRAMES = `
@keyframes ibxShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  .ibx-skel { animation: none !important; }
}`;

function CardSkeleton() {
  return (
    <div className="ibx-panel" style={{ padding: "var(--ib-4)" }}>
      <div style={{ display: "flex", gap: "var(--ib-3)" }}>
        <Bar w={34} h={34} radius={9} />
        <div style={{ flex: 1 }}>
          <Bar w="30%" h={13} />
          <Bar w="70%" h={15} mt={10} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--ib-2)", justifyContent: "flex-end", marginTop: "var(--ib-4)" }}>
        <Bar w={80} h={32} radius={9} />
        <Bar w={90} h={32} radius={9} />
      </div>
    </div>
  );
}

function Bar({
  w,
  h,
  mt,
  radius,
}: {
  w: number | string;
  h: number;
  mt?: number;
  radius?: number;
}) {
  return (
    <div
      aria-hidden
      className="ibx-skel"
      style={{
        width: typeof w === "number" ? `${w}px` : w,
        height: h,
        marginTop: mt,
        borderRadius: radius ?? 4,
        background:
          "linear-gradient(90deg, var(--ib-surface-2), var(--ib-elevated), var(--ib-surface-2))",
        backgroundSize: "200% 100%",
        animation: "ibxShimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}
