# Intelbase - Cinematic AI Command Plane (Design Spec)

> Date: 2026-06-06
> Status: Proposed - awaiting user approval before any code
> Inspired by: user-provided reels of a "PULSE / KRONOS" style live orchestration OS

## 1. What it is

**Intelbase** is a cinematic, simulated AI control plane: a living orchestration command
center where a galaxy of AI agents and client workspaces run a business in real time. It is
NOT a flat SaaS dashboard and NOT a chatbot wrapper. The central metaphor is a glowing
neural core surrounded by a massive multi-colored constellation of agent and client nodes,
wired together by luminous strands with data pulsing through them.

It is an **interactive simulated prototype**: fully clickable and alive (navigate, inspect
nodes, watch it run), with no real backend. It is also designed to be **screen-recorded for
social media** (the boot sequence and constellation are the money shots).

This is a FRESH build at a new route. The existing dense dashboard at `/os` is left
untouched.

## 2. Decisions locked with the user

- Name: **Intelbase**.
- Hero scope: **everything** - all tabs and functions (lead gen included), fully built.
- Reality: **interactive simulated prototype** (alive, clickable, no backend).
- Existing `/os`: **keep separate**, do not touch.
- Art direction: **reel's neural-graph structure + cool neon, but intelbase's palette**
  (blue / mint / violet on near-black), **multi-color per domain**.
- Mood: **Jarvis / Iron Man HUD**.
- Nodes: **two layers** - AI agents orbiting a core + client/workspace nodes to drill into.
- Gamification: **light** (MRR/Leads/Tasks/Uptime HUD + per-node level/XP, no heavy mechanics).
- Interactions: **all** - drag-rotate/zoom, click-to-inspect, keyboard (1-6) + cmd-K palette,
  watch-it-run live simulation.
- Boot: **fully-chained cinematic** (designer's choice, optimized to post on social).
- Operator/hustle layer (THE SYSTEM NEVER SLEEPS, focus timer): **skipped**. Pure cinematic.
- Icons: **distinct glowing icon tile per domain and node** (lucide / tabler, already installed).

## 3. Route, tech, constraints

- New route: **`/command`** (working name; trivial to rename). `/os` untouched.
- Stack: Next.js 16.2.2 fork (App Router conventions confirmed), React 19, TypeScript.
- 3D: **`@react-three/fiber` 9.5 + `three` 0.183** (installed). Use three's
  `examples/jsm/postprocessing/UnrealBloomPass` for real bloom and
  `examples/jsm/controls/OrbitControls` for orbit/zoom - **no new dependencies**
  (the fork is sensitive to reinstalls; avoid adding drei/postprocessing unless needed).
- UI chrome: framer-motion (`motion/react`, installed) for panels/transitions; hand-rolled
  SVG for sparklines; `lucide-react` + `@tabler/icons-react` for icons.
- Isolation: all new code under `src/app/command/`, `src/components/command/`,
  `src/lib/command/`. No edits to existing app code except an optional unlisted link.
- No em dashes in on-screen copy. Before writing route code, re-check the fork docs in
  `node_modules/next/dist/docs/` (App Router page conventions confirmed via the audit page).

## 4. Art direction

- Canvas: near-black `#05060b` with deep radial glows; subtle starfield/particle haze.
- Palette (intelbase): blue `#6ea8ff`, mint `#7df5c8`, violet `#b79cff`; warm domain accents
  amber `#ffb86b`, pink `#ff8fb1`, cyan `#67e8f9`. Each DOMAIN owns a color so the
  constellation reads multi-colored, like the reel.
- Signature effects (go all-in): **bloom + heavy glow**, **particles + flowing data**
  (strands carry traveling light pulses; ambient motes drift), **3D depth + cinematic camera**
  (parallax, slow drifts/pushes, subtle depth fade). Jarvis HUD energy: thin glowing rings,
  arcs, reactive highlights.
- Nodes: a **glowing colored rounded-square icon tile** (domain color) + label + a tiny
  sparkline, exactly like the latest reference. Hover lifts and highlights its strands.
- Strands: curved luminous bezier links; active routes show pulses traveling along them.
- Typography: existing Plus Jakarta Sans for chrome; mono (`ui-monospace`) for all telemetry
  and ids (e.g. `47-content-studio`, `act_...`).

## 5. Boot sequence (the postable open)

Fully-chained, ~7-9s, then settles into the live dashboard (and can loop for capture):
1. **Boot log** - a few mono lines type in over black ("initializing core", "mounting
   agents", "linking workspaces", "synapse check 42,000/42,000"), a thin progress arc.
2. **Wireframe core powers on** - a rotating wireframe icosahedron/core ignites at center.
3. **Brain regions ignite** - neural regions light up one by one, synapses fire.
4. **Constellation assembles** - agent + client nodes fly/fade in, strands snap-connect,
   the whole graph ignites with a bloom flash.
5. **Dissolve to dashboard** - camera pulls back, the boot visuals dissolve into the live
   command center (HUD, rail, feed, constellation already running).

A "skip" affordance and a replay control (for recording takes) are included.

## 6. Information architecture (the shell)

- **Left domain rail** (primary nav, vertical, icons + labels): Lead Gen, Outreach, Pipeline,
  Engagement, Follow Ups, Content, Systems, Finance, Ops, Recovery, Data, Automation. Each has
  a distinct glowing icon and owns an accent color. Selecting a domain themes/filters the
  constellation and the live feed to that domain (other clusters dim).
- **Top view tabs** (secondary, switch how you view the selected domain; keys 1-6):
  **Agents** (constellation), **Brain** (3D neural), **Deck**, **Team**, **Usage**,
  **Settings** (aka Space).
- **HUD (top-right)**: live counters - MRR, Leads, Tasks, Uptime - ticking via the sim. Light
  gamification only (no motivational tagline).
- **Live event feed (left column, inside views)**: streaming events (lead acquired, demo
  scheduled, agent fired, recovery triggered, content shipped) with timestamps and domain tags.
- **Command bar (bottom)** + **cmd-K command palette**: jump to any node/domain/tab, run
  simulated actions ("spawn agent", "focus node", "run sweep").
- **Right detail panel**: opens when a node is selected - title, type, domain, level + XP,
  status, description, current queue (list of tasks), connections (who it hands to), and
  action buttons (Inspect, Focus, Pause, Open workspace).

## 7. The constellation (Agents tab - the hero)

- **Massive / maximal**: 50+ nodes total in a 3D field, dense strand web, heavy bloom.
- **Layer 1 - Core + agents**: a central neural CORE; AI agent nodes orbit it (Concierge,
  Lead Gen, Outreach, Ad Engine, Nurture, Voice Receptionist, Inbox Manager, Content Studio,
  DM Operator, Comment Engagement, Recovery, Follow-ups, Data, Automation...). Strands to the
  core show routing/handoffs; pulses show live work.
- **Layer 2 - clients/workspaces**: client nodes (e.g. 47 Industries, North X Smoke Shop,
  Conscious Soul Skin, Wells Landscaping, plus generated ones to reach 50+) connected to the
  agents serving them. Clicking a client "drills in" (camera focuses, panel shows its agents,
  queue, MRR contribution).
- **Alive**: nodes pulse, occasionally "fire" (flash + emit a pulse down a strand + push a feed
  line), counters tick. A play/pause + speed control governs the sim.
- Interactions: orbit-drag, scroll-zoom, hover (highlight node + its strands + tooltip), click
  (detail panel + camera focus), domain filter (rail), cmd-K.

## 8. The other tabs

- **Brain (3D neural)**: the cinematic neural core full-screen. ~10 labeled regions (Concept,
  Prefrontal, Cerebellum, Sensory, Association, Memory, Routing, Recovery, Planning, Language),
  a dense particle "neuron" system ("42,000 neurons / 10 regions"), synapses firing along
  paths, drag-to-rotate, region hover/inspect. The "Structure = Growth" thesis screen.
- **Deck**: a browseable deck of agent/skill CARDS (premium trading-card feel): each card =
  icon, name, domain color, level/XP bar, key stats, and 2-3 "abilities". Flip/hover effects.
- **Team**: the AI + simulated-human roster (the reel's "Teammates"). Rows/cards of teammates
  with role, status (active/idle), current task, workload bar, and which agents they run.
- **Usage**: analytics - usage/compute over time (area charts), per-agent/per-domain usage
  bars, token + cost breakdown, top consumers. Serious data view.
- **Settings (Space)**: workspace + simulation controls (sim speed, node density, bloom
  intensity, color theme, boot replay), profile, and toggles. Doubles as the "director" panel
  for tuning the look before recording.

## 9. Simulation engine

A client-side engine (`src/lib/command/sim`) drives liveness: a tick loop advances time,
emits events into the feed, fires nodes, drifts counters, and animates strand pulses. Since
this is interactive (not a frame-recorded video), it may use real time/RAF freely. Fixtures
define the agents, clients, domains, connections, and the event vocabulary. A seeded-noise
layer keeps motion organic. (If we later want a deterministic capture for a perfectly-looping
social clip, we add a seedable/seek mode then.)

## 10. Build phases (so the hero lands fast)

1. **Phase 1 - the postable hero**: boot sequence + shell chrome (domain rail, top tabs, HUD,
   live feed, command bar) + the **Agents constellation** (R3F, 50+ nodes, bloom, multi-color,
   icon tiles, alive, click-to-inspect, orbit/zoom). This alone is the screen-recordable wow.
2. **Phase 2 - Brain tab**: the 3D neural core with regions + particle neurons + boot tie-in.
3. **Phase 3 - Deck / Team / Usage / Settings** + domain filtering wired across views + cmd-K.

## 11. Success criteria

- `/command` opens with the chained cinematic boot that dissolves into a live command center.
- The Agents constellation is massive, multi-colored, glowing, and visibly alive; you can
  orbit, zoom, hover, click nodes to inspect, and filter by domain.
- The Brain tab renders a rotatable glowing neural core with regions and firing synapses.
- Deck / Team / Usage / Settings exist and feel part of one premium system.
- It looks "insanely cool" (Jarvis HUD, bloom, particles, depth) and is screen-record ready.
- Zero new dependencies; `/os` and existing app untouched; build passes.

## 12. Open choices (defaulted; tell me to change)

- Route name `/command` (vs `/intelbase`, `/core`, `/control`).
- Central core codename shown on Brain (e.g. a KRONOS-like label) - default: just "Intelbase Core".
- Exact domain->color mapping (I will choose a tasteful multi-color assignment).
