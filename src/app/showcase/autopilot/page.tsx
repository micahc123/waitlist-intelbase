import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Database,
  Workflow,
  Inbox,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--ap-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ap-mono",
});

export const metadata: Metadata = { title: "Autopilot" };

/* ============ DATA ============ */

const KPIS = [
  { label: "Revenue MTD", value: "$124,380", delta: "+12%", deltaPos: true, sub: "vs $111k last month" },
  { label: "New leads · today", value: "47", delta: "+9", deltaPos: true, sub: "last 24h" },
  { label: "Tasks by autopilot", value: "213", delta: null, sub: "overnight · 0 failed" },
  { label: "Hours returned", value: "21h", delta: null, sub: "this week" },
];

const PIPELINE = [
  { label: "Lead", value: 74, tint: "bg-violet-300/50" },
  { label: "Qualified", value: 58, tint: "bg-violet-300/75" },
  { label: "Proposal", value: 42, tint: "bg-violet-400" },
  { label: "Negotiation", value: 26, tint: "bg-violet-300" },
  { label: "Won", value: 18, tint: "bg-emerald-400" },
];

const AUTOMATIONS = [
  { name: "Lead triage + auto-reply", latency: "0.9s avg", status: "running", runs: "47 today" },
  { name: "CRM nightly sync", latency: "42 min ago", status: "running", runs: "4 runs" },
  { name: "Cold outreach · batch 014", latency: "23 sent", status: "running", runs: "batch live" },
  { name: "Support triage + tag", latency: "1.4s avg", status: "running", runs: "12 today" },
  { name: "Invoice reminders", latency: "next 18:00", status: "idle", runs: "6 queued" },
  { name: "Weekly digest", latency: "Mon 06:45", status: "scheduled", runs: "next run" },
  { name: "Churn predictor", latency: "4h ago", status: "running", runs: "flags 3" },
  { name: "Expense extractor", latency: "1m ago", status: "running", runs: "8 today" },
  { name: "Duplicate merger", latency: "Tue 02:00", status: "scheduled", runs: "87 merged" },
];

const ACTIVITY = [
  { line: "Replied to inbound from matt@northpeak.co · high intent", t: "2s" },
  { line: "Moved deal Orbit / Series A → Negotiation", t: "11s" },
  { line: "Queued 31 outreach emails for Tuesday morning", t: "24s" },
  { line: "Flagged 2 support tickets needing legal review", t: "41s" },
  { line: "Archived 47 duplicate records in HubSpot", t: "58s" },
  { line: "Posted Q3 revenue digest to #exec Slack channel", t: "1m 14s" },
  { line: "Sent invoice reminder to 4 overdue customers", t: "2m 08s" },
  { line: "Drafted reply for support ticket #4129", t: "2m 41s" },
];

const DEALS = [
  { company: "Orbit Logistics", stage: "Negotiation", value: "$48,000", owner: "MR", close: "Apr 22", heat: "hot" },
  { company: "Meridian & Co.", stage: "Proposal", value: "$31,500", owner: "JL", close: "Apr 28", heat: "warm" },
  { company: "Pacific Grain", stage: "Qualified", value: "$22,000", owner: "MR", close: "May 04", heat: "warm" },
  { company: "Northpeak SaaS", stage: "Negotiation", value: "$67,200", owner: "TS", close: "Apr 24", heat: "hot" },
  { company: "Kindred Studio", stage: "Lead", value: "$18,000", owner: "JL", close: "May 10", heat: "cold" },
  { company: "Atlas Freight", stage: "Won", value: "$41,400", owner: "MR", close: "Apr 08", heat: "closed" },
];

const REVENUE = [38, 42, 45, 48, 51, 56, 62, 58, 64, 72, 78, 84, 88, 92];

const CHANNEL = [
  { name: "Inbound form", value: "42%", leads: "38 this week", color: "bg-violet-400" },
  { name: "Referral", value: "24%", leads: "22 this week", color: "bg-indigo-400" },
  { name: "LinkedIn outreach", value: "18%", leads: "16 this week", color: "bg-fuchsia-400" },
  { name: "Cold email", value: "11%", leads: "10 this week", color: "bg-sky-400" },
  { name: "Organic search", value: "5%", leads: "4 this week", color: "bg-emerald-400" },
];

/* ============ PAGE ============ */

export default function AutopilotDashboardPage() {
  return (
    <div
      className={`${sans.variable} ${mono.variable} min-h-screen bg-[#07070A] text-white antialiased`}
      style={{ fontFamily: "var(--ap-sans)" }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#07070A]/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-md border border-white/[0.08] bg-[#0D0E15] px-3 py-1 text-[11.5px] text-neutral-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          app.autopilot.co / dashboard
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.04] text-neutral-400 hover:text-white">
            <Bell className="h-3 w-3" />
          </button>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[10px] font-bold text-black">
            MR
          </div>
        </div>
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="sticky top-[46px] hidden h-[calc(100vh-46px)] w-[220px] shrink-0 overflow-y-auto border-r border-white/[0.05] bg-[#05060A] p-4 md:block">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-400 to-indigo-500">
              <div className="h-2.5 w-2.5 rounded-sm bg-black" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">Orbit Logistics</p>
              <p
                className="text-[9.5px] uppercase tracking-[0.22em] text-neutral-500"
                style={{ fontFamily: "var(--ap-mono)" }}
              >
                WORKSPACE
              </p>
            </div>
            <ChevronDown className="ml-auto h-3 w-3 text-neutral-500" />
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#0B0C12] px-2.5 py-1.5 text-[11.5px] text-neutral-400">
            <Search className="h-3 w-3" />
            <span>Search…</span>
            <span className="ml-auto text-[10px] text-neutral-600">⌘K</span>
          </div>

          <nav className="space-y-0.5">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Users, label: "Leads", badge: "14" },
              { icon: Briefcase, label: "Deals", badge: "47" },
              { icon: Database, label: "Customers", badge: "214" },
              { icon: Workflow, label: "Automations", badge: "9" },
              { icon: Inbox, label: "Inbox", badge: "3" },
              { icon: BarChart3, label: "Reports" },
              { icon: Settings, label: "Settings" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] ${
                    item.active
                      ? "bg-violet-500/[0.12] text-white"
                      : "text-neutral-400 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon
                      className={`h-3.5 w-3.5 ${item.active ? "text-violet-300" : "text-neutral-500"}`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-sm bg-white/[0.05] px-1 py-[1px] text-[10px] text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="mt-8 rounded-lg border border-violet-400/25 bg-violet-500/[0.06] p-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300"
              style={{ fontFamily: "var(--ap-mono)" }}
            >
              AGENT STATUS
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-neutral-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              9 running · 0 paused
            </p>
            <p className="mt-1 text-[10.5px] text-neutral-500">
              Last heartbeat 4s ago
            </p>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <div className="border-b border-white/[0.05] px-6 py-7 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[12px] text-neutral-500">Monday, April 13 · 06:42 local</p>
                <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-white sm:text-[32px]">
                  Good morning, Mara.
                </h1>
                <p className="mt-1 flex items-center gap-2 text-[13px] text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Everything&apos;s on track. 213 tasks handled overnight.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10.5px] text-neutral-400"
                  style={{ fontFamily: "var(--ap-mono)" }}
                >
                  UTC +00:00
                </span>
                <span
                  className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.08] px-2.5 py-1 text-[10.5px] text-emerald-300"
                  style={{ fontFamily: "var(--ap-mono)" }}
                >
                  ● LIVE
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1 — KPIs */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {KPIS.map((k) => (
                <div
                  key={k.label}
                  className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5"
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.22em] text-neutral-500"
                    style={{ fontFamily: "var(--ap-mono)" }}
                  >
                    {k.label}
                  </p>
                  <p className="mt-3 text-[30px] font-extrabold tracking-tight text-white">
                    {k.value}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11.5px]">
                    {k.delta && (
                      <span
                        className={`font-medium ${
                          k.deltaPos ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {k.delta}
                      </span>
                    )}
                    <span className="text-neutral-500">{k.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2 — Revenue chart + Channel mix */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              {/* Revenue chart */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[12.5px] font-semibold text-white">
                      Revenue · last 14 days
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Everything routed to Stripe · reconciled 06:31
                    </p>
                  </div>
                  <p
                    className="flex items-center gap-1.5 text-[11px] text-emerald-300"
                    style={{ fontFamily: "var(--ap-mono)" }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    +38% WoW
                  </p>
                </div>

                <svg viewBox="0 0 560 160" className="h-40 w-full">
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#a78bfa" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#a78bfa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const max = Math.max(...REVENUE);
                    const step = 560 / (REVENUE.length - 1);
                    const pts = REVENUE.map(
                      (v, i) => [i * step, 150 - (v / max) * 130] as [number, number],
                    );
                    const line = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
                    const fill = `${line} L560,150 L0,150 Z`;
                    return (
                      <>
                        <path d={fill} fill="url(#revFill)" />
                        <path d={line} stroke="#c4b5fd" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                          <circle
                            key={i}
                            cx={p[0]}
                            cy={p[1]}
                            r={i === pts.length - 1 ? 4 : 2}
                            fill={i === pts.length - 1 ? "#ece9e2" : "#c4b5fd"}
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>

                <div
                  className="mt-2 flex items-center justify-between text-[10px] tracking-[0.18em] text-neutral-500"
                  style={{ fontFamily: "var(--ap-mono)" }}
                >
                  <span>MAR 31</span>
                  <span>APR 13</span>
                </div>
              </div>

              {/* Channel mix */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <p className="text-[12.5px] font-semibold text-white">
                  Lead channels this week
                </p>
                <p className="text-[11px] text-neutral-500">
                  Inbound is up · referrals steady
                </p>

                <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/[0.04]">
                  {CHANNEL.map((c) => (
                    <div
                      key={c.name}
                      className={c.color}
                      style={{ width: c.value }}
                    />
                  ))}
                </div>

                <ul className="mt-5 space-y-2.5">
                  {CHANNEL.map((c) => (
                    <li key={c.name} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-sm ${c.color}`} />
                        <span className="text-neutral-200">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-white">{c.value}</span>
                        <span className="ml-2 text-[10.5px] text-neutral-500">{c.leads}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 3 — Pipeline + Active automations */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[12.5px] font-semibold text-white">Pipeline by stage</p>
                    <p className="text-[11px] text-neutral-500">Q2 · 218 open deals · $4.8M forecast</p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10.5px] text-neutral-400"
                    style={{ fontFamily: "var(--ap-mono)" }}
                  >
                    <Activity className="h-3 w-3" />
                    LIVE
                  </div>
                </div>
                <div className="flex h-[180px] items-end gap-4">
                  {PIPELINE.map((b) => (
                    <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-[150px] w-full items-end">
                        <div
                          className={`w-full rounded-t-md ${b.tint}`}
                          style={{ height: `${(b.value / 80) * 100}%` }}
                        />
                      </div>
                      <div className="w-full text-center">
                        <p className="text-[14px] font-semibold tracking-tight text-white">
                          {b.value}
                        </p>
                        <p
                          className="text-[9.5px] uppercase tracking-[0.18em] text-neutral-500"
                          style={{ fontFamily: "var(--ap-mono)" }}
                        >
                          {b.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-white">Active automations</p>
                  <span
                    className="text-[10px] tracking-[0.22em] text-violet-300"
                    style={{ fontFamily: "var(--ap-mono)" }}
                  >
                    9 RUNNING
                  </span>
                </div>
                <ul className="space-y-3">
                  {AUTOMATIONS.slice(0, 5).map((a) => (
                    <li key={a.name} className="flex items-center justify-between gap-3 text-[12px]">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            a.status === "running"
                              ? "animate-pulse bg-emerald-400"
                              : a.status === "idle"
                              ? "bg-neutral-600"
                              : "bg-violet-300"
                          }`}
                        />
                        <span className="truncate text-neutral-200">{a.name}</span>
                      </div>
                      <span className="shrink-0 text-[10.5px] text-neutral-500">
                        {a.latency}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 4 — Deals table */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="mb-1 text-[10px] tracking-[0.3em] text-violet-300"
                  style={{ fontFamily: "var(--ap-mono)" }}
                >
                  DEALS · ALL OPEN
                </p>
                <h2 className="text-[20px] font-bold tracking-tight text-white">
                  47 deals in flight.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {["All", "Hot", "Negotiation", "Won"].map((f, i) => (
                  <button
                    key={f}
                    className={`rounded-md px-2.5 py-1 text-[11px] ${
                      i === 0
                        ? "bg-white text-black"
                        : "border border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-[12.5px]">
                <thead
                  className="bg-[#0C0D13] text-[10px] uppercase tracking-[0.22em] text-neutral-500"
                  style={{ fontFamily: "var(--ap-mono)" }}
                >
                  <tr>
                    <th className="px-4 py-2.5 text-left">Company</th>
                    <th className="px-4 py-2.5 text-left">Stage</th>
                    <th className="px-4 py-2.5 text-right">Value</th>
                    <th className="hidden px-4 py-2.5 text-right sm:table-cell">Close</th>
                    <th className="px-4 py-2.5 text-right">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {DEALS.map((d, i) => (
                    <tr
                      key={d.company}
                      className={`border-t border-white/[0.04] ${i % 2 === 0 ? "bg-[#0B0C12]" : "bg-[#0A0B10]"}`}
                    >
                      <td className="px-4 py-3 text-white font-medium">{d.company}</td>
                      <td className="px-4 py-3 text-neutral-300">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-sm px-1.5 py-[1px] text-[10px] ${
                            d.stage === "Won"
                              ? "bg-emerald-500/[0.12] text-emerald-300"
                              : d.stage === "Negotiation"
                              ? "bg-violet-500/[0.12] text-violet-300"
                              : "bg-white/[0.04] text-neutral-300"
                          }`}
                          style={{ fontFamily: "var(--ap-mono)" }}
                        >
                          {d.stage.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {d.value}
                      </td>
                      <td className="hidden px-4 py-3 text-right text-neutral-400 sm:table-cell">
                        {d.close}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[9px] font-bold text-black">
                          {d.owner}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 5 — Inbox + Alerts */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <p className="mb-4 text-[12.5px] font-semibold text-white">
                  Inbox · handled by autopilot
                </p>
                <ul className="divide-y divide-white/[0.04]">
                  {[
                    { icon: Mail, who: "matt@northpeak.co", subj: "Re: demo next week?", tag: "REPLIED · 0.9s", tagColor: "text-emerald-300" },
                    { icon: Mail, who: "ops@kindred.studio", subj: "Vendor renewal Q2", tag: "ROUTED · legal", tagColor: "text-violet-300" },
                    { icon: Phone, who: "Voicemail · +1 (415)", subj: "Callback requested", tag: "TASK CREATED", tagColor: "text-cyan-300" },
                    { icon: MessageSquare, who: "Slack · #support", subj: "Ticket #4129 escalation", tag: "DRAFT READY", tagColor: "text-amber-300" },
                  ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <li key={i} className="flex items-center gap-3 py-2.5 text-[12.5px]">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-neutral-200">{m.who}</p>
                          <p className="truncate text-[11px] text-neutral-500">
                            {m.subj}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-sm bg-white/[0.03] px-1.5 py-[1px] text-[9.5px] ${m.tagColor}`}
                          style={{ fontFamily: "var(--ap-mono)" }}
                        >
                          {m.tag}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0C0D13] p-5">
                <p className="mb-4 text-[12.5px] font-semibold text-white">
                  Alerts · needs a human
                </p>
                <ul className="space-y-3">
                  {[
                    { icon: AlertCircle, color: "text-amber-300", text: "Northpeak deal stuck in Negotiation 14 days · nudge recommended" },
                    { icon: AlertCircle, color: "text-rose-300", text: "Customer ACME · last login 21 days ago · churn risk" },
                    { icon: AlertCircle, color: "text-violet-300", text: "Payment failed · Harbor Finance · $2,100 · retry scheduled" },
                  ].map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <li key={i} className="flex gap-3 text-[12.5px]">
                        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${a.color}`} />
                        <span className="text-neutral-200">{a.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <button className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-neutral-300 hover:text-white">
                  Review all
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 6 — Activity stream */}
          <section className="border-b border-white/[0.05] px-6 py-8 sm:px-10">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-[12.5px] font-semibold text-white">Recent activity</p>
              <span
                className="text-[10px] tracking-[0.22em] text-emerald-300"
                style={{ fontFamily: "var(--ap-mono)" }}
              >
                ● STREAMING
              </span>
            </div>
            <ul
              className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-[#0C0D13]"
              style={{ fontFamily: "var(--ap-mono)" }}
            >
              {ACTIVITY.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 text-[12px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-violet-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-neutral-200">{a.line}</span>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-neutral-500">
                    {a.t} ago
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Footer status bar */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-3 text-[10.5px] tracking-[0.18em] text-neutral-500 sm:px-10"
            style={{ fontFamily: "var(--ap-mono)" }}
          >
            <span>
              <span className="text-emerald-300">●</span> Connected · app.autopilot.co
            </span>
            <span>v2.4.1 · 9 agents alive · heartbeat 4s</span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <ArrowUpRight className="h-3 w-3" />
              help
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
