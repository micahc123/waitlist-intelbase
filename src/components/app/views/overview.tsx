// Overview - the default work-shell landing. A live dashboard surface: honest
// metric tiles (real numbers from the data layer, tabular mono, no fake wobble)
// plus a chronological activity feed (the agent audit trail). Fetches
// /api/app/overview on mount; shows a calm skeleton while loading and the shared
// .ibx-empty if the feed is genuinely empty. Data falls back to realistic DEMO
// values server-side when Supabase is unconfigured, so this is always populated.

"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  TrendingUp,
  Inbox,
  CheckCircle2,
  CalendarCheck,
  Percent,
  Wallet,
  Bot,
  MessageSquare,
  CalendarClock,
  Sparkles,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { ViewHead } from "./view-shell";

// ---------------------------------------------------------------------------
// Shared shapes + lookups (kept local; this view is one of only two files the
// task allows editing, so helpers live inline rather than in a new module).
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

interface OverviewData {
  metrics: {
    leadsThisWeek: number;
    bookings: number;
    responseTimeSeconds: number;
    conversionRate: number;
    messagesHandled: number;
    pipelineValueCents: number;
  };
  counts: {
    openApprovals: number;
    unreadInbox: number;
    activeLeads: number;
    bookings: number;
    agentRunsToday: number;
  };
  recent: ActionItem[];
}

function hkd(cents: number): string {
  const dollars = Math.round(cents / 100);
  return "HK$" + dollars.toLocaleString("en-HK");
}

export function Overview({ orgName }: { orgName: string }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/app/overview")
      .then((r) => r.json())
      .then((d: OverviewData) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const stats = data
    ? [
        {
          label: "Open approvals",
          value: String(data.counts.openApprovals),
          hint: "awaiting your sign-off",
          icon: CheckCircle2,
          accent: data.counts.openApprovals > 0 ? "var(--ib-amber)" : undefined,
        },
        {
          label: "Unread inbox",
          value: String(data.counts.unreadInbox),
          hint: "open + waiting threads",
          icon: Inbox,
        },
        {
          label: "Active leads",
          value: String(data.counts.activeLeads),
          hint: `${data.metrics.leadsThisWeek} new this week`,
          icon: TrendingUp,
        },
        {
          label: "Bookings",
          value: String(data.metrics.bookings),
          hint: "booked or won",
          icon: CalendarCheck,
        },
        {
          label: "Conversion",
          value: Math.round(data.metrics.conversionRate * 100) + "%",
          hint: "won of decided leads",
          icon: Percent,
        },
        {
          label: "Pipeline",
          value: hkd(data.metrics.pipelineValueCents),
          hint: "open opportunity value",
          icon: Wallet,
        },
        {
          label: "Agent runs today",
          value: String(data.counts.agentRunsToday),
          hint: `${data.metrics.messagesHandled} messages handled`,
          icon: Bot,
        },
      ]
    : [];

  return (
    <div className="ibx">
      <style>{SHIMMER_KEYFRAMES}</style>
      <ViewHead
        title={`Welcome back, ${orgName}`}
        subtitle="A live read on the work your AI operating system is doing for you."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "var(--ib-3)",
          marginBottom: "var(--ib-5)",
        }}
      >
        {loading
          ? Array.from({ length: 7 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s) => (
              <div
                key={s.label}
                className="ibx-panel"
                style={{ padding: "var(--ib-4)" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "var(--ib-text-3)",
                  }}
                >
                  <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>
                    {s.label}
                  </span>
                  <s.icon size={16} />
                </div>
                <div
                  className="ibx-mono"
                  style={{
                    marginTop: "var(--ib-3)",
                    fontSize: "var(--ib-fs-2xl)",
                    fontWeight: 700,
                    color: s.accent ?? "var(--ib-text)",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    marginTop: "var(--ib-2)",
                    fontSize: "var(--ib-fs-xs)",
                    color: "var(--ib-text-4)",
                  }}
                >
                  {s.hint}
                </div>
              </div>
            ))}
      </div>

      <div className="ibx-panel">
        <div className="ibx-panel-head">
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--ib-2)",
              fontWeight: 600,
            }}
          >
            <Activity size={16} style={{ color: "var(--ib-text-3)" }} />
            Activity
          </span>
          <span style={{ fontSize: "var(--ib-fs-xs)", color: "var(--ib-text-4)" }}>
            What your agents have done lately
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "var(--ib-2) 0" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedSkeleton key={i} />
            ))}
          </div>
        ) : !data || data.recent.length === 0 ? (
          <div className="ibx-empty">
            <div className="ibx-empty-icon">
              <Activity size={22} />
            </div>
            <div
              style={{
                fontSize: "var(--ib-fs-base)",
                fontWeight: 600,
                color: "var(--ib-text-2)",
              }}
            >
              No activity yet
            </div>
            <div style={{ maxWidth: "44ch" }}>
              As your agents handle approvals, replies, and leads, a chronological
              stream of what happened will appear here.
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {data.recent.map((a) => (
              <FeedRow key={a.id} action={a} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FeedRow({ action }: { action: ActionItem }) {
  const agent = AGENT_META[action.agent_id] ?? AGENT_META.ops;
  const AgentIcon = agent.icon;
  const status = STATUS_META[action.status] ?? STATUS_META.auto;

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--ib-3)",
        padding: "var(--ib-3) var(--ib-4)",
        borderBottom: "1px solid var(--ib-hairline)",
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 30,
          height: 30,
          flexShrink: 0,
          borderRadius: "var(--ib-r-sm)",
          background: "var(--ib-surface-2)",
          border: "1px solid var(--ib-border)",
          color: agent.color,
        }}
      >
        <AgentIcon size={15} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: "var(--ib-fs-sm)",
            color: "var(--ib-text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {action.summary}
        </div>
        <div
          style={{
            fontSize: "var(--ib-fs-xs)",
            color: "var(--ib-text-4)",
            marginTop: 2,
          }}
        >
          {agent.name}
        </div>
      </div>
      <span className={`ibx-chip ${status.chip}`} style={{ flexShrink: 0 }}>
        <span className="ibx-chip-dot" />
        {status.label}
      </span>
      <span
        className="ibx-mono"
        style={{
          flexShrink: 0,
          width: 64,
          textAlign: "right",
          fontSize: "var(--ib-fs-xs)",
          color: "var(--ib-text-4)",
        }}
      >
        {relativeTime(action.created_at)}
      </span>
    </li>
  );
}

const SHIMMER_KEYFRAMES = `
@keyframes ibxShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) {
  .ibx-skel { animation: none !important; }
}`;

function StatSkeleton() {
  return (
    <div className="ibx-panel" style={{ padding: "var(--ib-4)" }}>
      <Bar w="60%" h={13} />
      <Bar w="50%" h={28} mt={14} />
      <Bar w="70%" h={11} mt={10} />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--ib-3)",
        padding: "var(--ib-3) var(--ib-4)",
      }}
    >
      <Bar w={30} h={30} radius={9} />
      <div style={{ flex: 1 }}>
        <Bar w="55%" h={12} />
        <Bar w="25%" h={10} mt={8} />
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
