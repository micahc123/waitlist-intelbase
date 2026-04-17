import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  Search,
  Bell,
  Play,
  FolderOpen,
  Sparkle,
  Wand2,
  ListVideo,
  Clapperboard,
  Cpu,
  Send,
  ArrowUpRight,
  Download,
  Heart,
  MessageSquare,
  Share2,
  Settings,
} from "lucide-react";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--rc-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--rc-mono",
});

export const metadata: Metadata = {
  title: "Reelcraft Studio",
};

/* ============ PROJECT DATA ============ */

const PROJECTS = [
  { label: "Q2 · Brand relaunch", active: true, count: "12" },
  { label: "Founder hooks vol.3", count: "8" },
  { label: "Black Friday · paid" },
  { label: "UGC · customer diaries" },
  { label: "Podcast · cut-downs" },
];

const RENDERS = [
  { num: "01", tint: "from-cyan-500 via-violet-500 to-fuchsia-500", pct: 100, label: "serum · studio" },
  { num: "02", tint: "from-indigo-600 via-sky-500 to-cyan-400", pct: 100, label: "morning pour" },
  { num: "03", tint: "from-pink-500 via-fuchsia-500 to-violet-600", pct: 88, label: "pattern-break" },
  { num: "04", tint: "from-sky-500 via-cyan-400 to-emerald-400", pct: 64, label: "hands · macro" },
  { num: "05", tint: "from-violet-600 via-indigo-500 to-rose-400", pct: 32, label: "founder · pov" },
  { num: "06", tint: "from-amber-400 via-rose-500 to-fuchsia-500", pct: 8, label: "logo stinger" },
];

const LIBRARY = [
  { title: "Your skin isn't tired. It's bored.", tint: "from-rose-500 via-fuchsia-500 to-violet-700", tag: "HOOK · A/B WINNER", views: "1.2M", likes: "184K", comments: "3.4K", duration: "0:14" },
  { title: "Six ingredients. No lies.", tint: "from-emerald-500 via-teal-500 to-cyan-500", tag: "PRODUCT", views: "812K", likes: "97K", comments: "1.1K", duration: "0:21" },
  { title: "When the founder writes the ad.", tint: "from-amber-400 via-orange-500 to-rose-500", tag: "POV", views: "2.4M", likes: "301K", comments: "8.8K", duration: "0:28" },
  { title: "Serum, not a ritual.", tint: "from-fuchsia-500 via-purple-500 to-indigo-600", tag: "PATTERN-BREAK", views: "640K", likes: "72K", comments: "894", duration: "0:11" },
  { title: "The drop that stopped the feed.", tint: "from-indigo-500 via-blue-500 to-cyan-400", tag: "UGC", views: "1.8M", likes: "212K", comments: "4.1K", duration: "0:19" },
  { title: "Built by two people. In a month.", tint: "from-rose-400 via-pink-500 to-purple-600", tag: "STORY", views: "410K", likes: "48K", comments: "612", duration: "0:34" },
  { title: "Halcyon, day 48.", tint: "from-teal-400 via-emerald-500 to-lime-400", tag: "DAILY", views: "292K", likes: "31K", comments: "405", duration: "0:12" },
  { title: "Not a routine. A reset.", tint: "from-cyan-400 via-sky-400 to-indigo-400", tag: "CAMPAIGN", views: "1.1M", likes: "134K", comments: "2.1K", duration: "0:16" },
];

const ACTIVITY = [
  { line: "Claude drafted 6 hooks for Halcyon / brief-017", t: "0:02s" },
  { line: "Higgsfield queued 6 renders · GPU farm · 4× A100", t: "0:04s" },
  { line: "Render 01 complete · serum · studio", t: "4m 12s" },
  { line: "Render 02 complete · morning pour", t: "4m 41s" },
  { line: "Hook A/B test started · variants 01 vs 03", t: "7m 08s" },
  { line: "Posted render 01 to @halcyon · IG Reels", t: "12m 22s" },
];

/* ============ PAGE ============ */

export default function ReelcraftDashboardPage() {
  return (
    <div
      className={`${sans.variable} ${mono.variable} min-h-screen bg-[#05060A] text-neutral-100 antialiased`}
      style={{ fontFamily: "var(--rc-sans)" }}
    >
      {/* Window chrome */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#05060A]/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-md border border-white/[0.08] bg-[#0C0D12] px-3 py-1 text-[11.5px] text-neutral-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          studio.reelcraft.co / halcyon · brief-017
        </div>
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-2 text-[10px] tracking-[0.2em] text-neutral-500 md:flex"
            style={{ fontFamily: "var(--rc-mono)" }}
          >
            GPU · 4× A100
          </div>
          <button className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.04] text-neutral-400 hover:text-white">
            <Bell className="h-3 w-3" />
          </button>
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
        </div>
      </div>

      <div className="flex">
        {/* SIDEBAR */}
        <aside className="sticky top-[46px] hidden h-[calc(100vh-46px)] w-[220px] shrink-0 overflow-y-auto border-r border-white/[0.05] bg-[#04050A] p-4 md:block">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="relative h-7 w-7 overflow-hidden rounded-md ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
              <div className="absolute inset-[5px] rounded-[3px] bg-black" />
              <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white">Halcyon Studio</p>
              <p
                className="text-[9.5px] uppercase tracking-[0.22em] text-neutral-500"
                style={{ fontFamily: "var(--rc-mono)" }}
              >
                WORKSPACE
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#0B0C12] px-2.5 py-1.5 text-[11.5px] text-neutral-400">
            <Search className="h-3 w-3" />
            <span>Search reels…</span>
            <span className="ml-auto text-[10px] text-neutral-600">⌘K</span>
          </div>

          <p
            className="mb-2 text-[9.5px] uppercase tracking-[0.22em] text-neutral-500"
            style={{ fontFamily: "var(--rc-mono)" }}
          >
            Projects
          </p>
          <nav className="mb-6 space-y-0.5">
            {PROJECTS.map((p) => (
              <div
                key={p.label}
                className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[12px] ${
                  p.active
                    ? "bg-cyan-500/[0.1] text-white"
                    : "text-neutral-400 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FolderOpen
                    className={`h-3.5 w-3.5 ${p.active ? "text-cyan-300" : "text-neutral-500"}`}
                  />
                  <span className="truncate">{p.label}</span>
                </div>
                {p.count && (
                  <span
                    className="shrink-0 rounded-sm bg-white/[0.05] px-1 py-[1px] text-[9.5px] text-neutral-400"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    {p.count}
                  </span>
                )}
              </div>
            ))}
          </nav>

          <p
            className="mb-2 text-[9.5px] uppercase tracking-[0.22em] text-neutral-500"
            style={{ fontFamily: "var(--rc-mono)" }}
          >
            Studio
          </p>
          <nav className="mb-6 space-y-0.5">
            {[
              { icon: Sparkle, label: "Prompts" },
              { icon: Wand2, label: "Style presets" },
              { icon: ListVideo, label: "Render queue", badge: "6" },
              { icon: Clapperboard, label: "Library", badge: "148" },
              { icon: Settings, label: "Settings" },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.label}
                  className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-neutral-400 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-neutral-500" />
                    {p.label}
                  </div>
                  {p.badge && (
                    <span
                      className="rounded-sm bg-cyan-500/[0.12] px-1 py-[1px] text-[9.5px] text-cyan-300"
                      style={{ fontFamily: "var(--rc-mono)" }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="rounded-lg border border-cyan-400/25 bg-cyan-500/[0.06] p-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300"
              style={{ fontFamily: "var(--rc-mono)" }}
            >
              GPU FARM
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-neutral-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              312 / 400 queued
            </p>
            <p className="mt-1 text-[10.5px] text-neutral-500">
              avg render 4m 12s
            </p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" />
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* Header band */}
          <div className="border-b border-white/[0.05] bg-gradient-to-b from-[#0A0C12] to-transparent px-6 py-7 sm:px-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p
                  className="text-[10px] tracking-[0.3em] text-cyan-300"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  BRIEF · 017 · HALCYON / SERUM LAUNCH
                </p>
                <h1 className="mt-2 text-[26px] font-bold tracking-tight text-white sm:text-[30px]">
                  New brief in progress.
                </h1>
                <p className="mt-1 text-[12.5px] text-neutral-400">
                  Claude is writing · Higgsfield is rendering · 6 in queue, 2 complete
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[10.5px] text-neutral-400"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  1080 × 1920 · 60FPS
                </span>
                <span
                  className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.08] px-2.5 py-1 text-[10.5px] text-emerald-300"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  ● LIVE
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1 — Command input + Claude response */}
          <section className="border-b border-white/[0.05] px-6 py-10 sm:px-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-amber-300 to-orange-400">
                <span className="text-[11px] font-black text-black">C</span>
              </div>
              <p className="text-[13px] font-semibold text-white">Claude Code</p>
              <span
                className="text-[9.5px] tracking-[0.22em] text-neutral-500"
                style={{ fontFamily: "var(--rc-mono)" }}
              >
                STREAMING · 1.2K tok
              </span>
            </div>

            {/* Input bar where the command was pressed */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-[#0A0C12] px-4 py-3 shadow-[0_0_40px_-10px_rgba(34,211,238,0.35)]">
              <Cpu className="h-4 w-4 text-cyan-300" />
              <p className="flex-1 text-[13.5px] text-neutral-200">
                Generate 6 hook scripts for Halcyon&apos;s serum launch. Voice:
                editorial, quiet confidence.{" "}
                <span className="inline-block h-[1em] w-[1px] translate-y-[2px] animate-pulse bg-cyan-300" />
              </p>
              <button className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              {/* Assistant reply card */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0B0D12] p-5">
                <p className="text-[13px] leading-[1.7] text-neutral-200">
                  Pulling brand voice from{" "}
                  <span
                    className="rounded bg-cyan-500/[0.1] px-1.5 py-px text-cyan-300"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    memory/voice.md
                  </span>
                  . Six hooks drafted, one flagged pattern-break:
                </p>
                <ol className="mt-4 space-y-1.5 text-[12.5px] text-neutral-300">
                  <li><span className="text-cyan-300">01</span> · &ldquo;your skin isn&apos;t tired. it&apos;s bored.&rdquo;</li>
                  <li><span className="text-cyan-300">02</span> · &ldquo;six ingredients. no lies.&rdquo;</li>
                  <li>
                    <span className="text-cyan-300">03</span> · &ldquo;serum, not a ritual.&rdquo;{" "}
                    <span className="text-[10px] text-fuchsia-300">pattern-break</span>
                  </li>
                  <li><span className="text-cyan-300">04</span> · &ldquo;twelve drops. done.&rdquo;</li>
                  <li><span className="text-cyan-300">05</span> · &ldquo;skin that looks slept.&rdquo;</li>
                  <li><span className="text-cyan-300">06</span> · &ldquo;routines are for cowards.&rdquo;</li>
                </ol>
                <p className="mt-4 text-[11.5px] text-neutral-400">
                  Visual briefs piped to Higgsfield · queue length 6 · ETA 4m 40s.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-sm bg-emerald-500/[0.1] px-1.5 py-[1px] text-[10px] text-emerald-300"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    ✓ PIPED TO HIGGSFIELD
                  </span>
                  <span
                    className="rounded-sm bg-cyan-500/[0.1] px-1.5 py-[1px] text-[10px] text-cyan-300"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    6 RENDERS QUEUED
                  </span>
                  <span
                    className="rounded-sm bg-fuchsia-500/[0.1] px-1.5 py-[1px] text-[10px] text-fuchsia-300"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    A/B TEST · 01 vs 03
                  </span>
                </div>
              </div>

              {/* Brief meta */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0B0D12] p-5">
                <p
                  className="mb-4 text-[9.5px] uppercase tracking-[0.25em] text-neutral-500"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  Brief meta
                </p>
                <dl className="space-y-3 text-[12px]">
                  {[
                    ["Project", "Q2 · Brand relaunch"],
                    ["Voice", "Editorial · quiet confidence"],
                    ["Length", "12–30 seconds"],
                    ["Aspect", "9:16"],
                    ["Tokens", "1,214 in · 2,980 out"],
                    ["Model", "Claude Opus 4.7"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-3">
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="text-right text-neutral-200">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* SECTION 2 — Higgsfield render queue */}
          <section className="border-b border-white/[0.05] px-6 py-10 sm:px-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-fuchsia-400 to-cyan-400">
                  <span className="text-[11px] font-black text-black">H</span>
                </div>
                <p className="text-[13px] font-semibold text-white">
                  Higgsfield · Render farm
                </p>
                <span
                  className="text-[9.5px] tracking-[0.22em] text-neutral-500"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  BATCH 017 · 60% COMPLETE
                </span>
              </div>
              <p
                className="text-[10.5px] tracking-[0.22em] text-neutral-400"
                style={{ fontFamily: "var(--rc-mono)" }}
              >
                ETA 01m 54s
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {RENDERS.map((r) => (
                <div
                  key={r.num}
                  className="group relative aspect-[9/14] overflow-hidden rounded-xl border border-white/[0.08]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.tint}`} />
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(at 30% 30%, rgba(255,255,255,0.35), transparent 60%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-30"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
                    }}
                  />
                  <div
                    className="absolute left-2 top-2 rounded-sm bg-black/55 px-1.5 py-[1px] text-[9px] tracking-[0.18em] text-white/90"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    {r.num}
                  </div>
                  <div
                    className="absolute right-2 top-2 flex items-center gap-1 rounded-sm bg-black/55 px-1.5 py-[1px] text-[9px] text-white/90"
                    style={{ fontFamily: "var(--rc-mono)" }}
                  >
                    {r.pct === 100 ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        DONE
                      </>
                    ) : (
                      <>
                        <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300" />
                        {r.pct}%
                      </>
                    )}
                  </div>
                  <div className="absolute inset-x-2 bottom-2">
                    <p
                      className="mb-1 text-[9.5px] tracking-[0.18em] text-white/75"
                      style={{ fontFamily: "var(--rc-mono)" }}
                    >
                      {r.label.toUpperCase()}
                    </p>
                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-black/40">
                      <div
                        className={`h-full ${r.pct === 100 ? "bg-emerald-400" : "bg-cyan-300"}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4 text-[10.5px] tracking-[0.18em] text-neutral-400"
              style={{ fontFamily: "var(--rc-mono)" }}
            >
              <span>
                <span className="text-cyan-300">RENDER</span> · 6 jobs · 4 workers
              </span>
              <span>avg 4m 12s</span>
            </div>
          </section>

          {/* SECTION 3 — Generated reels library */}
          <section id="library" className="border-b border-white/[0.05] px-6 py-10 sm:px-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  className="mb-2 text-[10px] tracking-[0.3em] text-fuchsia-300"
                  style={{ fontFamily: "var(--rc-mono)" }}
                >
                  LIBRARY · GENERATED REELS
                </p>
                <h2 className="text-[22px] font-bold tracking-tight text-white sm:text-[26px]">
                  148 reels · 12 posted this week.
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {["All", "Posted", "Drafts", "A/B winners"].map((f, i) => (
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

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {LIBRARY.map((r, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B0D12] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[9/14] overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${r.tint}`} />
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage:
                          "radial-gradient(at 30% 30%, rgba(255,255,255,0.35), transparent 60%)",
                      }}
                    />
                    <div
                      className="absolute inset-0 mix-blend-overlay opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
                      }}
                    />

                    <div
                      className="absolute left-3 top-3 rounded-sm bg-black/55 px-1.5 py-[2px] text-[9px] tracking-[0.18em] text-white/85"
                      style={{ fontFamily: "var(--rc-mono)" }}
                    >
                      {r.tag}
                    </div>
                    <div
                      className="absolute right-3 top-3 rounded-sm bg-black/55 px-1.5 py-[2px] text-[9px] tracking-[0.18em] text-white/85"
                      style={{ fontFamily: "var(--rc-mono)" }}
                    >
                      {r.duration}
                    </div>

                    <div className="absolute inset-x-3 bottom-3">
                      <p className="text-[15px] font-bold leading-[1.15] text-white drop-shadow-lg">
                        {r.title}
                      </p>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                        <Play className="ml-0.5 h-4 w-4 text-black" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] px-3.5 py-2.5 text-[10.5px] text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {r.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {r.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {r.views}
                      </span>
                    </div>
                    <Download className="h-3 w-3" />
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 4 — Activity log */}
          <section className="border-b border-white/[0.05] px-6 py-10 sm:px-10">
            <div className="mb-5 flex items-center gap-3">
              <p className="text-[13px] font-semibold text-white">Activity log</p>
              <span
                className="text-[9.5px] tracking-[0.22em] text-emerald-300"
                style={{ fontFamily: "var(--rc-mono)" }}
              >
                ● STREAMING
              </span>
            </div>
            <ul
              className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.06] bg-[#0B0D12]"
              style={{ fontFamily: "var(--rc-mono)" }}
            >
              {ACTIVITY.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 px-4 py-2.5 text-[12px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-cyan-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-neutral-200">{a.line}</span>
                  </div>
                  <span className="shrink-0 text-[10.5px] text-neutral-500">
                    +{a.t}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Footer status bar */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-3 text-[10.5px] tracking-[0.18em] text-neutral-500 sm:px-10"
            style={{ fontFamily: "var(--rc-mono)" }}
          >
            <span>
              <span className="text-emerald-300">●</span> Connected · studio.reelcraft.co
            </span>
            <span>v2.14.0 · Render daemon alive · 4× A100</span>
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
