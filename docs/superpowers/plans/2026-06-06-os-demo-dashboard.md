# intelbase OS Demo Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-playing, screen-recordable multi-module "intelbase OS" dashboard at `/os`, then record it with Playwright and edit it into a finished cinematic MP4 with ffmpeg — entirely in-house, $0.

**Architecture:** A new isolated route `/os` renders an OS shell (sidebar + screen area). A single deterministic clock (`useDemoTimeline`) drives a scripted 75s story; every panel derives its animated state from the clock `t`, so the whole thing loops identically (essential for clean filming and re-takes). No backend, no network, fixture data only. A Playwright script records deterministic clips by seeking the clock; an ffmpeg script assembles them with transitions, captions, and music.

**Tech Stack:** Next.js 16.2.2 (modified fork — standard App Router conventions confirmed), React 19, framer-motion v12 (installed), Tailwind v4 + existing `globals.css` design tokens, hand-rolled SVG charts, Playwright (via MCP) for recording, ffmpeg 8.1 for editing.

---

## Conventions & guardrails (read once before starting)

- **Fork:** App Router page convention confirmed against `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`. Default-export a component from `page.tsx`; `metadata` export optional. Do not assume other behavior without re-checking the fork docs.
- **Isolation:** Only create files under `src/app/os/`, `src/components/os/`, `src/lib/os-demo/`, and the recording/edit scripts under `scripts/os-video/`. The ONLY edit to an existing file is the ChatWidget pathname guard (Task 1).
- **No em dashes** in any on-screen copy or caption.
- **Determinism:** Nothing visual may read `Date.now()` or `Math.random()` at render time. All motion derives from the timeline `t` and precomputed fixture values. This is what makes recordings repeatable.
- **Design tokens:** Match `src/app/globals.css` (dark bg, glow, accent). Reuse existing CSS custom properties where present; add OS-scoped classes under an `.os-root` namespace to avoid collisions.
- **Verification model:** No unit-test runner is installed and the fork's `node_modules` is fragile — do NOT add one. Verify via (a) `npm run build` passing, and (b) Playwright assertions that seek the clock and check the DOM. Visual review via Playwright screenshots.

Dev server: `npm run dev` (http://localhost:3000). Build gate: `npm run build`.

---

## File structure

```
src/app/os/page.tsx                  # thin route, renders <OsApp/>
src/components/os/os-app.tsx          # shell: sidebar nav + active screen + clock provider
src/components/os/sidebar.tsx         # module nav + agents-online status
src/components/os/screens/overview.tsx
src/components/os/screens/concierge.tsx
src/components/os/screens/pipeline.tsx
src/components/os/screens/nurture.tsx
src/components/os/screens/ad-engine.tsx
src/components/os/screens/modules.tsx
src/components/os/ui/kpi.tsx          # animated counter + sparkline
src/components/os/ui/sparkline.tsx    # SVG line
src/components/os/ui/bars.tsx         # SVG bar chart
src/components/os/ui/feed.tsx         # activity feed list + item
src/components/os/ui/frame.tsx        # panel/card frame, tag, status dot
src/components/os/os.css              # OS-scoped styles (imported by os-app)
src/lib/os-demo/types.ts             # shared types
src/lib/os-demo/timeline.ts          # event list + clock logic (pure)
src/lib/os-demo/use-timeline.tsx     # React provider/hook around the clock
src/lib/os-demo/fixtures.ts          # all fixture data
src/components/chat-widget.tsx        # MODIFY: hide on /os
scripts/os-video/record.mjs          # Playwright recording harness
scripts/os-video/edit.sh             # ffmpeg assembly -> final mp4
scripts/os-video/captions.json       # caption text + timings (data for edit.sh)
```

---

### Task 1: OS route scaffold + shell + ChatWidget guard

**Files:**
- Create: `src/app/os/page.tsx`
- Create: `src/components/os/os-app.tsx`
- Create: `src/components/os/os.css`
- Modify: `src/components/chat-widget.tsx`

- [ ] **Step 1: Create the route (thin page)**

`src/app/os/page.tsx`:
```tsx
import type { Metadata } from "next";
import { OsApp } from "@/components/os/os-app";

export const metadata: Metadata = {
  title: "intelbase OS",
  robots: { index: false, follow: false }, // demo surface, keep out of search
};

export default function OsPage() {
  return <OsApp />;
}
```

- [ ] **Step 2: Create a placeholder shell**

`src/components/os/os-app.tsx`:
```tsx
"use client";

import "./os.css";

export function OsApp() {
  return (
    <div className="os-root">
      <div className="os-shell">
        <aside className="os-sidebar">sidebar</aside>
        <main className="os-screen">screen</main>
      </div>
    </div>
  );
}
```

`src/components/os/os.css`:
```css
.os-root { position: fixed; inset: 0; background: #07080d; color: #e7ecff; overflow: hidden; }
.os-shell { display: grid; grid-template-columns: 248px 1fr; height: 100%; }
.os-sidebar { border-right: 1px solid rgba(255,255,255,.06); padding: 20px; }
.os-screen { padding: 28px 32px; overflow: hidden; }
```

- [ ] **Step 3: Hide ChatWidget on /os**

In `src/components/chat-widget.tsx`, add at the top of the component body (it is already a client component). First read the file to find the component function, then add:
```tsx
import { usePathname } from "next/navigation";
// ...inside the component, before any early returns / render:
const pathname = usePathname();
if (pathname?.startsWith("/os")) return null;
```
If `usePathname` import already exists, do not duplicate it. Keep the guard as the first statement so hooks order stays stable (place it after any existing hooks if hooks are already called above; if so, instead gate the returned JSX: `if (pathname?.startsWith("/os")) return null;` must run after all hooks — move it below the last hook call).

- [ ] **Step 4: Verify route + clean chrome**

Run: `npm run dev`, then with Playwright navigate to `http://localhost:3000/os`.
Expected: shell renders, NO floating chat bubble visible, no top-nav/footer. Take a screenshot for confirmation.

- [ ] **Step 5: Build gate**

Run: `npm run build`
Expected: compiles with no errors. Pay attention to any fork-specific route warnings.

- [ ] **Step 6: Commit**
```bash
git add src/app/os src/components/os src/components/chat-widget.tsx
git commit -m "feat(os-demo): scaffold /os route, shell, and chat-widget guard"
```

---

### Task 2: Timeline engine (deterministic clock)

**Files:**
- Create: `src/lib/os-demo/types.ts`
- Create: `src/lib/os-demo/timeline.ts`
- Create: `src/lib/os-demo/use-timeline.tsx`

- [ ] **Step 1: Types**

`src/lib/os-demo/types.ts`:
```ts
export type ScreenId = "overview" | "concierge" | "pipeline" | "nurture" | "ad-engine" | "modules";

export interface StoryEvent {
  at: number;            // seconds into the loop when this fires
  id: string;            // unique key, e.g. "visitor-arrives"
  screen: ScreenId;      // which screen this beat belongs to (for auto-tour)
  feed?: string;         // optional activity-feed line to append (no em dashes)
}

export interface TimelineState {
  t: number;             // current seconds into the loop [0, LOOP)
  fired: Set<string>;    // event ids that have fired at or before t
  has: (id: string) => boolean;
  progress: number;      // t / LOOP, 0..1
}

export const LOOP_SECONDS = 75;
```

- [ ] **Step 2: Pure timeline data + helpers**

`src/lib/os-demo/timeline.ts`:
```ts
import { LOOP_SECONDS, type StoryEvent, type TimelineState } from "./types";

export const STORY: StoryEvent[] = [
  { at: 0,  id: "boot",            screen: "overview",  feed: "All 5 agents online" },
  { at: 8,  id: "visitor-arrives", screen: "concierge", feed: "Concierge answered a visitor in 3s" },
  { at: 20, id: "lead-qualified",  screen: "pipeline",  feed: "Lead qualified: Harbour Dental" },
  { at: 35, id: "call-booked",     screen: "concierge", feed: "Call booked for Fri 3:00pm" },
  { at: 50, id: "budget-shift",    screen: "ad-engine", feed: "Ad budget moved to top creative" },
  { at: 62, id: "reactivation",    screen: "nurture",   feed: "Reactivated a dormant lead" },
  { at: 72, id: "summary",         screen: "overview",  feed: "12 actions taken autonomously this hour" },
];

export function stateAt(t: number): TimelineState {
  const clamped = ((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS;
  const fired = new Set(STORY.filter((e) => e.at <= clamped).map((e) => e.id));
  return {
    t: clamped,
    fired,
    has: (id) => fired.has(id),
    progress: clamped / LOOP_SECONDS,
  };
}

// Eased 0..1 ramp for an event over `dur` seconds after it fires.
export function ramp(t: number, at: number, dur: number): number {
  const x = Math.max(0, Math.min(1, (t - at) / dur));
  return x * x * (3 - 2 * x); // smoothstep
}
```

- [ ] **Step 3: React provider/hook with seek support**

`src/lib/os-demo/use-timeline.tsx`:
```tsx
"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { LOOP_SECONDS } from "./types";
import { stateAt } from "./timeline";

interface Ctx { t: number; playing: boolean; seek: (s: number) => void; setPlaying: (b: boolean) => void; }
const TimelineCtx = createContext<Ctx | null>(null);

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    // Expose a seek hook for the Playwright recorder (deterministic frames).
    (window as unknown as { __osSeek?: (s: number) => void }).__osSeek = (s: number) => {
      setPlaying(false);
      setT(((s % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (last.current == null) last.current = now;
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => (prev + dt) % LOOP_SECONDS);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); last.current = null; };
  }, [playing]);

  return (
    <TimelineCtx.Provider value={{ t, playing, seek: setT, setPlaying }}>
      {children}
    </TimelineCtx.Provider>
  );
}

export function useTimeline() {
  const ctx = useContext(TimelineCtx);
  if (!ctx) throw new Error("useTimeline must be used inside TimelineProvider");
  return { ...ctx, state: stateAt(ctx.t) };
}
```

- [ ] **Step 4: Wire provider into the shell**

Wrap the shell body in `os-app.tsx` with `<TimelineProvider>` (import from `@/lib/os-demo/use-timeline`). Leave placeholder sidebar/screen for now.

- [ ] **Step 5: Verify determinism via Playwright**

With dev server running, Playwright: navigate `/os`, then `browser_evaluate`: `window.__osSeek(20); return document.body.innerHTML.length`. Re-run the same seek twice; assert the engine returns and the page does not throw. (Full DOM assertions come once screens exist — Task 11.)

- [ ] **Step 6: Build gate + commit**
```bash
npm run build
git add src/lib/os-demo src/components/os/os-app.tsx
git commit -m "feat(os-demo): deterministic timeline engine + provider with seek"
```

---

### Task 3: Fixture data

**Files:**
- Create: `src/lib/os-demo/fixtures.ts`

- [ ] **Step 1: Author fixtures** (all copy free of em dashes)

`src/lib/os-demo/fixtures.ts`:
```ts
export const AGENTS = [
  { id: "concierge", name: "Concierge", color: "#6ea8ff" },
  { id: "leadgen", name: "Lead Gen", color: "#7df5c8" },
  { id: "nurture", name: "Nurture", color: "#ffd166" },
  { id: "ads", name: "Ad Engine", color: "#ff8fb1" },
  { id: "control", name: "Control", color: "#b79cff" },
];

// Concierge conversation, revealed line-by-line off the clock.
export const CHAT = [
  { at: 8.0,  who: "visitor", text: "Hi, do you handle dental clinics in Hong Kong?" },
  { at: 9.5,  who: "ai",      text: "Yes. We run your front office end to end. Are you mostly losing leads after hours, or during the day?" },
  { at: 13.0, who: "visitor", text: "After hours mostly. Nobody answers the website at night." },
  { at: 15.0, who: "ai",      text: "That is exactly what the Concierge fixes. Roughly how many enquiries a week?" },
  { at: 18.0, who: "visitor", text: "Maybe 30 to 40." },
  { at: 20.0, who: "ai",      text: "Got it. You qualify as a strong fit. Want me to book a quick call?" },
  { at: 33.0, who: "visitor", text: "Sure, Friday afternoon works." },
  { at: 35.0, who: "ai",      text: "Booked for Friday 3:00pm. Confirmation is on the way." },
];

export const QUAL_TAGS = ["Dental", "Hong Kong", "After-hours gap", "30-40 leads/wk", "Strong fit"];

// Pipeline cards. `stage` is the resting stage; the hero card advances via the clock.
export interface Lead { id: string; name: string; value: string; stage: "new" | "qualified" | "booked" | "won"; hero?: boolean; }
export const LEADS: Lead[] = [
  { id: "l1", name: "Harbour Dental", value: "HK$48k", stage: "new", hero: true },
  { id: "l2", name: "Kowloon Physio", value: "HK$22k", stage: "qualified" },
  { id: "l3", name: "Central Law Co", value: "HK$60k", stage: "booked" },
  { id: "l4", name: "Sai Ying Pun Cafe", value: "HK$9k", stage: "qualified" },
  { id: "l5", name: "Tsim Sha Tsui Spa", value: "HK$31k", stage: "won" },
  { id: "l6", name: "Wanchai Realty", value: "HK$75k", stage: "new" },
];

export const SEQUENCES = [
  { id: "s1", name: "Welcome + qualify", steps: 4, active: 128, replies: 19 },
  { id: "s2", name: "Reactivation 90d", steps: 5, active: 64, replies: 11 },
  { id: "s3", name: "Post-call nurture", steps: 3, active: 41, replies: 7 },
];

export const CREATIVES = [
  { id: "c1", name: "After-hours hook", spendStart: 38, spendEnd: 61, roas: 4.2, winner: true },
  { id: "c2", name: "Speed-to-lead", spendStart: 34, spendEnd: 22, roas: 2.1 },
  { id: "c3", name: "Owner testimonial", spendStart: 28, spendEnd: 17, roas: 1.6 },
];

export const EXPANSION = [
  { name: "AI Voice Receptionist", on: true },
  { name: "AI Inbox Manager", on: true },
  { name: "Multilingual Front Desk", on: true },
  { name: "Quote & Proposal Builder", on: false },
  { name: "Reactivation Engine", on: true },
  { name: "Market & Competitor Watch", on: false },
];

// KPI end-values; counters animate from a baseline up to these across the loop.
export const KPIS = {
  answered: { label: "Visitors answered", base: 1180, end: 1206, unit: "" },
  qualified: { label: "Leads qualified", base: 84, end: 91, unit: "" },
  booked: { label: "Calls booked", base: 22, end: 26, unit: "" },
  roas: { label: "Blended ROAS", base: 3.1, end: 3.6, unit: "x" },
};
```

- [ ] **Step 2: Build gate + commit**
```bash
npm run build
git add src/lib/os-demo/fixtures.ts
git commit -m "feat(os-demo): fixture data for all screens"
```

---

### Task 4: OS UI primitives

**Files:**
- Create: `src/components/os/ui/frame.tsx`, `sparkline.tsx`, `bars.tsx`, `kpi.tsx`, `feed.tsx`
- Modify: `src/components/os/os.css`

- [ ] **Step 1: Panel frame + tag + status dot**

`src/components/os/ui/frame.tsx`:
```tsx
export function Panel({ title, tag, children, className = "" }: { title?: string; tag?: string; children: React.ReactNode; className?: string; }) {
  return (
    <section className={`os-panel ${className}`}>
      {(title || tag) && (
        <header className="os-panel-head">
          {title && <h3>{title}</h3>}
          {tag && <span className="os-tag">{tag}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Dot({ color }: { color: string }) {
  return <span className="os-dot" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />;
}
```

- [ ] **Step 2: SVG sparkline**

`src/components/os/ui/sparkline.tsx`:
```tsx
export function Sparkline({ points, color = "#6ea8ff", w = 120, h = 36 }: { points: number[]; color?: string; w?: number; h?: number; }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / span) * h;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="os-spark">
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
```

- [ ] **Step 3: SVG bar chart** (`bars.tsx`) — horizontal bars with animatable widths.
```tsx
export function Bars({ rows }: { rows: { label: string; value: number; max: number; color: string; sub?: string }[] }) {
  return (
    <div className="os-bars">
      {rows.map((r) => (
        <div className="os-bar-row" key={r.label}>
          <span className="os-bar-label">{r.label}</span>
          <div className="os-bar-track">
            <div className="os-bar-fill" style={{ width: `${Math.min(100, (r.value / r.max) * 100)}%`, background: r.color }} />
          </div>
          <span className="os-bar-val">{r.sub ?? r.value}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: KPI counter** (`kpi.tsx`) — interpolates base->end by clock progress.
```tsx
import { Sparkline } from "./sparkline";

export function Kpi({ label, value, unit, series, color }: { label: string; value: number; unit: string; series: number[]; color: string; }) {
  const display = unit === "x" ? value.toFixed(1) : Math.round(value).toLocaleString();
  return (
    <div className="os-kpi">
      <div className="os-kpi-top"><span className="os-kpi-val">{display}{unit}</span></div>
      <div className="os-kpi-label">{label}</div>
      <Sparkline points={series} color={color} />
    </div>
  );
}
```

- [ ] **Step 5: Activity feed** (`feed.tsx`) — renders the list of fired feed lines newest-first with a framer-motion enter.
```tsx
import { AnimatePresence, motion } from "motion/react";

export function Feed({ lines }: { lines: { id: string; text: string }[] }) {
  return (
    <ul className="os-feed">
      <AnimatePresence initial={false}>
        {lines.map((l) => (
          <motion.li key={l.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="os-feed-item">
            <span className="os-feed-dot" /> {l.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```
Note: framer-motion v12 is published as the `motion` package; import from `motion/react`. Confirm against installed version before use.

- [ ] **Step 6: Styles** — add `.os-panel`, `.os-tag`, `.os-dot`, `.os-spark`, `.os-bars`, `.os-kpi`, `.os-feed*` classes to `os.css`, matching `globals.css` tokens (rounded 14px panels, subtle border `rgba(255,255,255,.07)`, panel bg `rgba(255,255,255,.025)`, accent glow). Keep it consistent and minimal.

- [ ] **Step 7: Build gate + commit**
```bash
npm run build
git add src/components/os/ui src/components/os/os.css
git commit -m "feat(os-demo): shared OS UI primitives (panel, sparkline, bars, kpi, feed)"
```

---

### Tasks 5-10: The six screens

Each screen is a client component that calls `useTimeline()` and derives state from `state.t` / `state.has(id)` / `ramp()`. Shared rules for all six:
- Pure presentational off the clock. No random, no Date.
- Wrap entering elements with `motion` from `motion/react` for reveals.
- Use the Task 4 primitives and the Task 3 fixtures.

#### Task 5: Overview (`screens/overview.tsx`)
- [ ] KPI row of 4 using `Kpi`, each value interpolated: `base + (end-base)*state.progress`, sparkline = precomputed series rising to end (generate deterministically from base/end, e.g. 12 points eased).
- [ ] Activity feed (left) built from `STORY.filter(e => state.has(e.id) && e.feed)` mapped to `{id, text:e.feed}`, reversed (newest first).
- [ ] Agents-online strip from `AGENTS` with `Dot`.
- [ ] At `state.has("summary")`, show a highlighted "12 actions taken autonomously this hour" banner (the 72s beat).
- [ ] Verify via Playwright: seek 0 -> few feed lines; seek 73 -> summary banner visible; screenshot.
- [ ] Commit: `feat(os-demo): overview screen`.

#### Task 6: Concierge (`screens/concierge.tsx`)
- [ ] Chat thread reveals `CHAT.filter(m => m.at <= state.t)`; AI "typing" indicator shows when the next message `at` is within 1.5s ahead.
- [ ] Right rail: qualification tags from `QUAL_TAGS` appearing progressively after `lead-qualified`.
- [ ] On `state.has("call-booked")`, show a booking confirmation card (Fri 3:00pm).
- [ ] Verify via Playwright: seek 10 -> first 2 messages; seek 36 -> booking card; screenshot.
- [ ] Commit: `feat(os-demo): concierge screen`.

#### Task 7: Pipeline (`screens/pipeline.tsx`)
- [ ] Four columns (New, Qualified, Booked, Won) rendered from `LEADS` by `stage`.
- [ ] The hero card (`Harbour Dental`) overrides its column based on the clock: `new` until 20s, `qualified` 20-35s, `booked` after 35s. Animate position with framer-motion `layout` so it glides between columns.
- [ ] Column count badges update accordingly.
- [ ] Verify via Playwright: seek 5 -> hero in New; seek 25 -> Qualified; seek 40 -> Booked; screenshot each.
- [ ] Commit: `feat(os-demo): pipeline screen with auto-advancing card`.

#### Task 8: Nurture (`screens/nurture.tsx`)
- [ ] List sequences from `SEQUENCES` with `Bars` showing active contacts; reply counts tick up slightly with `state.progress`.
- [ ] On `state.has("reactivation")`, surface a "Reactivated: dormant lead replied" highlight row.
- [ ] Verify via Playwright: seek 65 -> reactivation highlight; screenshot.
- [ ] Commit: `feat(os-demo): nurture screen`.

#### Task 9: Ad Engine (`screens/ad-engine.tsx`)
- [ ] Render `CREATIVES` spend as `Bars`; each creative's spend interpolates `spendStart -> spendEnd` using `ramp(state.t, 50, 8)` (the budget-shift beat at 50s).
- [ ] Show blended ROAS rising; a callout "Budget moved to top creative" appears at `state.has("budget-shift")`.
- [ ] Verify via Playwright: seek 45 -> pre-shift widths; seek 60 -> winner bar widest + callout; screenshot.
- [ ] Commit: `feat(os-demo): ad engine screen with budget reallocation`.

#### Task 10: Modules (`screens/modules.tsx`)
- [ ] Grid of `EXPANSION` modules as toggle cards (on = accent glow, off = muted). Static but polished; one card can flip on at ~68s for life if desired (optional, keep deterministic).
- [ ] Verify via Playwright: screenshot.
- [ ] Commit: `feat(os-demo): modules screen`.

---

### Task 11: Story wiring, auto-tour, summary, loop polish

**Files:**
- Modify: `src/components/os/os-app.tsx`, `src/components/os/sidebar.tsx` (create)

- [ ] **Step 1: Sidebar** — create `sidebar.tsx`: nav items for the six screens, an "agents online" footer, and the intelbase wordmark. Highlight the active screen.

- [ ] **Step 2: Auto-tour** — in `os-app.tsx`, the active screen follows the story: derive the current screen from the latest fired `STORY` event's `screen` (so the camera moves to whichever module is acting), but allow manual sidebar override that holds for a few seconds. Keep a small "AUTO" indicator. Crossfade screens with framer-motion.

- [ ] **Step 3: Loop seam** — verify the transition from t≈74 back to t=0 is visually clean (feed resets, hero card resets to New). If a panel pops, add a 0.5s fade at the seam.

- [ ] **Step 4: Determinism assertions (the real verification)** — Playwright script asserts, for a set of seeks, the expected DOM:
  - seek 9 -> concierge thread has ≥1 visitor message
  - seek 25 -> pipeline hero card is under the Qualified column
  - seek 36 -> concierge booking card present
  - seek 60 -> ad-engine winner callout present
  - seek 73 -> overview summary banner present
  Run twice; assert identical results (determinism).

- [ ] **Step 5: Build gate + commit**
```bash
npm run build
git add src/components/os
git commit -m "feat(os-demo): sidebar, auto-tour, summary beat, loop polish"
```

---

### Task 12: Playwright recording harness

**Files:**
- Create: `scripts/os-video/record.mjs`

Goal: produce deterministic per-scene clips by seeking the clock and capturing frames. Approach: for each scene, seek to a start time, then step the clock forward in small increments capturing screenshots, and let ffmpeg assemble frames into a clip (most robust + fully deterministic, avoids real-time capture jitter).

- [ ] **Step 1: Decide capture method** — frame-sequence capture (deterministic):
  - Viewport 1920x1080, deviceScaleFactor 1, hide cursor.
  - For each scene `{screen, from, to, fps:30}`: set active screen via sidebar click or a `window.__osScreen(id)` helper (add this helper in os-app alongside `__osSeek`), then for frame `n`, `window.__osSeek(from + n/fps)`, wait a tick, screenshot to `scripts/os-video/frames/<screen>/%05d.png`.

- [ ] **Step 2: Add `window.__osScreen` helper** in `os-app.tsx` to force the active screen (records cleanly without depending on auto-tour).

- [ ] **Step 3: Write `record.mjs`** using Playwright (the project can run it via `npx playwright`; if `playwright` is not installed as a dep, run through the MCP Playwright tools instead, scene by scene). Scene list mirrors the story:
  ```
  overview  0-8, concierge 8-37, pipeline 18-42, nurture 60-68, ad-engine 46-62, overview 70-75
  ```
- [ ] **Step 4: Run capture**, verify each `frames/<screen>/` folder has the expected count (`(to-from)*fps`). Spot-check a few PNGs visually.
- [ ] **Step 5: Commit** (frames are large — add `scripts/os-video/frames/` to `.gitignore`; commit only the script).
```bash
echo "scripts/os-video/frames/" >> .gitignore
echo "scripts/os-video/clips/" >> .gitignore
echo "scripts/os-video/out/" >> .gitignore
git add scripts/os-video/record.mjs .gitignore src/components/os/os-app.tsx
git commit -m "feat(os-demo): Playwright frame-sequence recording harness"
```

---

### Task 13: ffmpeg edit pipeline -> final MP4

**Files:**
- Create: `scripts/os-video/edit.sh`, `scripts/os-video/captions.json`

- [ ] **Step 1: Frames -> per-scene clips**
For each scene folder: `ffmpeg -framerate 30 -i frames/<screen>/%05d.png -c:v libx264 -pix_fmt yuv420p -vf "scale=1920:1080" clips/<scene>.mp4`.

- [ ] **Step 2: Cinematic push-ins** — apply `zoompan` per scene for a slow 1.0 -> 1.06 push so static shots feel alive:
`-vf "zoompan=z='min(zoom+0.0005,1.06)':d=1:s=1920x1080:fps=30"` (tune per scene; some scenes already animate internally and can skip this).

- [ ] **Step 3: Captions** — `captions.json` holds `{ scene, text, in, out }` (copy free of em dashes), burned with `drawtext` (font from a known path, e.g. system `/System/Library/Fonts/Supplemental/Arial.ttf`), lower-third style with a translucent box: `drawtext=fontfile=...:text='Answers every visitor in 3 seconds':x=80:y=h-160:fontsize=40:fontcolor=white:box=1:boxcolor=0x07080dCC:boxborderw=24:enable='between(t,0,3)'`.

- [ ] **Step 4: Assemble with crossfades** — chain scenes with `xfade` (0.6s, `fade`/`smoothleft`) and an end card (title + booking CTA + logo) generated either as a final frames scene or a `color`+`drawtext` 3s clip.

- [ ] **Step 5: Music + audio fades** — mix a user-provided or royalty-free track: `-i music.mp3 -filter_complex "...;[mus]afade=t=in:st=0:d=1,afade=t=out:st=72:d=3[a]"`. If no track is provided, export silent and note it for the user to add.

- [ ] **Step 6: Final export** — `out/intelbase-os-demo-1080p.mp4`, H.264 yuv420p, ~75s, faststart: `-movflags +faststart`.

- [ ] **Step 7: Verify** — `ffprobe out/intelbase-os-demo-1080p.mp4` shows ~75s, 1920x1080, 30fps. Open/preview a frame via Playwright or screenshot. Confirm captions and transitions render.

- [ ] **Step 8: Commit**
```bash
git add scripts/os-video/edit.sh scripts/os-video/captions.json
git commit -m "feat(os-demo): ffmpeg edit pipeline produces final 1080p demo mp4"
```

---

## Optional follow-up (NOT in this plan, requires approval)
- Higgsfield AI intro sizzle B-roll. Install CLI (`npm i -g @higgsfield/cli`), `higgsfield auth login` (user's browser), `npx skills add higgsfield-ai/skills`. Generation costs credits — per-batch approval required before any run. Splice the resulting clip in front of the ffmpeg assembly (Task 13, Step 4) as the opener.

---

## Self-review notes
- **Spec coverage:** route+isolation (T1), engine/determinism (T2), fixtures (T3), all six screens (T5-10), scripted 75s story + loop (T2 STORY + T11), Playwright recording (T12), ffmpeg edit -> MP4 with transitions/captions/music/end-card (T13), cost/zero-spend honored (Higgsfield deferred). No gaps.
- **No-spend rule:** nothing in T1-13 spends money or deploys. Higgsfield isolated to optional follow-up with approval.
- **Type consistency:** `ScreenId`, `StoryEvent`, `TimelineState`, `stateAt`, `ramp`, `useTimeline().state`, `window.__osSeek`/`__osScreen` referenced consistently across tasks.
- **Fork safety:** route/page convention pre-verified; only existing-file edit is the ChatWidget guard; no test framework added.
```
