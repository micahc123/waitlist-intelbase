# intelbase OS — Cinematic Demo Dashboard (Design Spec)

> Date: 2026-06-06
> Status: Approved (brainstorming) — ready for implementation plan
> Owner: micah

## 1. Purpose

Produce a finished, cinematic **product demo video** of "intelbase OS" by building a
self-playing, screen-recordable multi-module dashboard, recording it deterministically,
and editing it into a final MP4 entirely in-house (Claude Code + Playwright + ffmpeg).

This replaces the idea of embedding the live chat agent on the homepage as the demo, and
replaces paying a Fiverr editor. The output is a marketing asset, not a real product.

## 2. Non-goals / explicit constraints

- **Not the real product.** Fully scripted with fixture data. No backend, no
  `ANTHROPIC_API_KEY`, no lead store, no network calls, **zero runtime cost.**
- **Must not touch** the live agent code or the real internal leads dashboard
  (`src/app/dashboard/page.tsx`, `src/app/api/{agent,leads,...}`). Built in isolation.
- **No spend is auto-executed.** Higgsfield (the only paid, optional step) is deferred and
  requires per-batch approval. Consistent with the project's press-go hand-back rule.
- **No em dashes** in any on-screen copy or generated content (project style rule).
- **Modified Next.js fork (16.2.2).** Before writing any route/page code, read the relevant
  guide in `node_modules/next/dist/docs/` — routing and file conventions may differ from
  stock Next.js. Do not assume App Router conventions from training data.
- Caption-only video with a music bed. No voiceover (cannot synth audio).
- Target: ~75 second film, 1080p (1440p optional).

## 3. Product context (what the OS claims to do)

From the live site copy:
- Tagline: "An AI operating system that runs your front office, autonomously."
- "Answers every visitor, qualifies every lead, books your calls, and runs your ads, on its
  own. You watch the whole thing work on one dashboard."

Core five modules: AI Website Concierge, Autonomous Lead Generation, Lead Nurture on
Autopilot, AI Ad Engine, One Control Dashboard. Expansion modules: AI Voice Receptionist,
AI Inbox Manager, Multilingual Front Desk, Quote & Proposal Builder, Reactivation Engine,
Market & Competitor Watch.

The "One Control Dashboard" is the hero of the video.

## 4. Architecture

### 4.1 Route + isolation
- New route at **`/os`** (verify file convention against the fork docs first).
- New code only in:
  - `src/components/os/` — all UI panels and the OS shell.
  - `src/lib/os-demo/` — the timeline engine, fixture data, types.
- No edits to existing modules except (optionally) an unlisted nav link. This keeps the
  Phase 3 agent untouched and unbreakable.

### 4.2 The demo engine (`src/lib/os-demo/`)
- A single deterministic clock: `useDemoTimeline()` exposing `t` (seconds into the loop),
  `phase`, and helpers to query "has event X fired."
- A `timeline` array of timed events. Each panel subscribes to `t` and derives its own
  animated state. One clock keeps all panels in sync and makes the whole thing loop
  identically (critical for clean filming and re-takes).
- Loop length configurable (default 75s). Restart/seek controls available for recording.
- Built on **framer-motion** (already a dependency) for scene transitions, reveals, and
  push-ins. Charts/sparklines are hand-rolled SVG (no chart lib needed).
- Ambient motion layer: even with no scripted event active, counters drift, the activity
  feed streams, and sparklines breathe so any still frame looks alive.

### 4.3 Determinism
- No `Date.now()` / `Math.random()` driving visuals at record time (would desync re-takes).
  Use the timeline `t` and seeded/precomputed fixture values so every recording is identical.

## 5. Screens (sidebar OS shell)

1. **Overview** — command center. Animated KPIs (visitors answered, leads qualified, calls
   booked, ROAS), live activity feed of AI actions, agent status ("5 agents online"), mini
   sparklines.
2. **Concierge** — chat inbox. Visitor arrives, AI types and answers in seconds,
   qualification tags appear, booking confirmed.
3. **Pipeline** — kanban (New, Qualified, Booked, Won). Cards glide across columns on their
   own; a lead detail drawer.
4. **Nurture** — sequences. Contacts flow through email/WhatsApp steps; opens/replies tick
   up; a dormant lead re-engaged.
5. **Ad Engine** — campaign performance. AI reallocates budget between creatives; ROAS
   climbs; charts animate.
6. **Modules** — expansion modules as elegant toggles ("grows with you").

Visual language matches the existing site design system in `src/app/globals.css` (dark,
glow rings, accent color) so the demo reads as the real product.

## 6. Scripted story (~75s loop)

A single lead's journey, visible across the OS:

| Time | Beat |
|------|------|
| 0s   | Idle. Agents online, ambient motion. |
| 8s   | Visitor arrives. Concierge answers in 3s. Activity feed logs it. |
| 20s  | AI qualifies the lead. Pipeline card moves New -> Qualified. KPI ticks. |
| 35s  | Call booked. Card -> Booked. "Calls booked" +1. Confirmation shown. |
| 50s  | Ad Engine shifts budget to the winning creative. ROAS climbs. |
| 62s  | Nurture re-engages a dormant lead. A reply lands. |
| 72s  | Summary beat: "12 actions taken autonomously this hour." |
| ->   | Loop. |

## 7. Production pipeline (all in Claude Code, $0)

1. **Build** the `/os` dashboard (sections 4-6).
2. **Record** clips with Playwright: navigate each screen while the timeline plays, capture
   deterministic 1080p video per scene. Hide cursor/chrome; fixed viewport.
3. **Edit** with ffmpeg 8.1 (verified installed, all filters present):
   - `xfade` crossfades/wipes between scenes.
   - `zoompan` cinematic push-ins on static shots.
   - `drawtext` captions, titles, lower-thirds (e.g. "Answers every visitor in 3 seconds").
   - `overlay` logo + lower-thirds; `fade` + `afade`/`acrossfade` for in/out.
   - Music bed (user-provided or royalty-free) with fade and ducking.
   - End card with logo + booking CTA.
   - Export final **MP4 (1080p)**.

### 7.1 ffmpeg ceiling (honest limits)
- No 3D logo reveals, particle effects, or After Effects-grade motion graphics.
- No generated voiceover.
- Optional paid bolt-on: **Higgsfield** intro sizzle B-roll (credits, per-batch approval).

## 8. Cost

- Build + record + full edited video in Claude Code: **$0.**
- Higgsfield intro sizzle: optional, credits only, with approval. Not required.

## 9. Success criteria

- `/os` loads in isolation, plays the 75s story on loop, and every panel animates in sync.
- All six screens look like a real, polished product matching the site's design system.
- Playwright produces clean, repeatable 1080p clips with no manual filming.
- ffmpeg assembles a finished ~75s 1080p MP4 with transitions, captions, and music.
- Zero changes to live agent / leads code; no runtime cost; no auto-spend.
