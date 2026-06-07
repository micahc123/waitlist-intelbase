// Overview - the default work-shell landing. A real dashboard surface. For now
// it ships honest, calm placeholder stat panels + an empty activity feed; the
// next wave wires live data into these slots.

import { Activity, TrendingUp, Inbox, CheckCircle2 } from "lucide-react";
import { ViewHead, EmptyPanel } from "./view-shell";

const STATS = [
  { label: "Open approvals", value: "--", hint: "awaiting your sign-off", icon: CheckCircle2 },
  { label: "Unread inbox", value: "--", hint: "across all channels", icon: Inbox },
  { label: "Active leads", value: "--", hint: "in pipeline", icon: TrendingUp },
  { label: "Agent runs today", value: "--", hint: "automations executed", icon: Activity },
];

export function Overview({ orgName }: { orgName: string }) {
  return (
    <div className="ibx">
      <ViewHead
        title={`Welcome back, ${orgName}`}
        subtitle="A live read on the work your AI operating system is doing for you."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--ib-4)",
          marginBottom: "var(--ib-5)",
        }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="ibx-panel" style={{ padding: "var(--ib-4)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "var(--ib-text-3)",
              }}
            >
              <span style={{ fontSize: "var(--ib-fs-sm)", fontWeight: 600 }}>{s.label}</span>
              <s.icon size={16} />
            </div>
            <div
              className="ibx-mono"
              style={{
                marginTop: "var(--ib-3)",
                fontSize: "var(--ib-fs-2xl)",
                fontWeight: 700,
                color: "var(--ib-text)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ marginTop: "var(--ib-2)", fontSize: "var(--ib-fs-xs)", color: "var(--ib-text-4)" }}>
              {s.hint}
            </div>
          </div>
        ))}
      </div>

      <EmptyPanel
        icon={<Activity size={22} />}
        title="This is where your activity feed lives"
        body="As your agents handle approvals, replies, and leads, a chronological stream of what happened (and what needs you) will appear here."
      />
    </div>
  );
}
