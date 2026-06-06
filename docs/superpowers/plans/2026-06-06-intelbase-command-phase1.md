# Intelbase Command Plane - Phase 1 Plan (boot + shell + live constellation)

> Goal: the screen-recordable HERO. A new route `/command` that boots with a chained
> cinematic sequence dissolving into a live command center: a domain rail, view tabs, an MRR/
> Leads/Tasks/Uptime HUD, a streaming event feed, a command bar, a right detail panel, and the
> star of the show - a massive 50+ node, multi-colored, glowing, alive constellation you can
> orbit, zoom, hover, and click to inspect.

> Spec: docs/superpowers/specs/2026-06-06-intelbase-command-plane-design.md

## Tech approach (Phase 1)

- **Constellation = 2.5D** (DOM + SVG + canvas), NOT WebGL. Nodes are projected from 3D
  positions to 2D each frame (perspective), rendered as DOM icon tiles (so we get crisp icons,
  labels, sparklines, and easy interactivity) with CSS bloom; strands as an SVG bezier layer
  with animated pulses; ambient particles on a canvas. Drag rotates the point cloud (azimuth/
  elevation), wheel zooms. This de-risks Phase 1 and nails the icon-tile fidelity. (True WebGL
  is reserved for the Brain tab in Phase 2, using the already-installed three + R3F.)
- Stack: React 19, framer-motion (`motion/react`), `lucide-react` / `@tabler/icons-react` for
  icons, hand-rolled SVG sparklines. No new dependencies.
- Isolation: everything under `src/app/command/` + `src/components/command/` + `src/lib/command/`.
- No em dashes in on-screen copy. Re-confirm App Router page conventions in the fork docs
  before writing the route (the audit page already verified default-export page + metadata).

## Shared contracts (ALL tasks depend on these - define in Task 1, do not deviate)

`src/lib/command/types.ts`:
```ts
export type Vec3 = { x: number; y: number; z: number };
export type DomainId =
  | "leadgen" | "outreach" | "pipeline" | "engagement" | "followups" | "content"
  | "systems" | "finance" | "ops" | "recovery" | "data" | "automation";
export type ViewId = "agents" | "brain" | "deck" | "team" | "usage" | "settings";

export interface Domain { id: DomainId; label: string; color: string; icon: string; } // icon = lucide name

export type NodeKind = "core" | "agent" | "client";
export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string;
  domain: DomainId;       // core uses a neutral domain
  icon: string;           // lucide icon name
  pos: Vec3;              // layout position in a roughly [-1,1] cube
  level: number;          // light gamification
  xp: number;            // 0..100 (percent to next level)
  status: "active" | "idle" | "working";
  queue: string[];        // current task lines (no em dashes)
  metric: string;         // a headline stat e.g. "HK$48k" or "1,204 sent"
  series: number[];       // ~12 points for the node sparkline
}
export interface Link { from: string; to: string; }     // ids
export interface FeedEvent { id: string; t: number; domain: DomainId; tag: string; text: string; }
```

`src/lib/command/use-sim.tsx` exposes via `useSim()`:
```ts
interface Sim {
  t: number;                       // seconds since mount (RAF)
  nodes: GraphNode[];
  links: Link[];
  domains: Domain[];
  activeDomain: DomainId | null;   // null = all
  setActiveDomain: (d: DomainId | null) => void;
  view: ViewId;
  setView: (v: ViewId) => void;
  selected: string | null;         // selected node id
  setSelected: (id: string | null) => void;
  feed: FeedEvent[];               // newest-first, capped ~40
  counters: { mrr: number; leads: number; tasks: number; uptimeSec: number };
  firing: Set<string>;             // node ids currently "firing" this tick
  paused: boolean; setPaused: (b: boolean) => void;
  speed: number; setSpeed: (n: number) => void;
}
```
Liveness: a RAF loop advances `t`; every ~0.6s/speed a random-but-seeded node "fires"
(added to `firing` briefly) and pushes a `FeedEvent`; counters drift upward; uptime ticks.
This is interactive (not frame-recorded), so real time/RAF is fine. Use seeded helpers for
organic motion (reuse the pattern from `src/lib/os-demo/telemetry.ts` if helpful, but keep
command code self-contained).

`src/lib/command/data.ts`: builds `DOMAINS` (12), and `buildGraph()` returning `{nodes, links}`:
- 1 core node at origin.
- ~14 agent nodes on an inner shell (radius ~0.45) spaced around the core, each assigned a
  domain + lucide icon (Concierge=message, Lead Gen=target, Outreach=send, Content=pen,
  Recovery=lifebuoy, etc.).
- ~36 client nodes on outer shells (radius ~0.8-1.1) clustered near the agent/domain that
  serves them (varied HK business names; generate to reach 50+ total).
- links: each client -> its serving agent; each agent -> core.
- Deterministic positions (golden-angle / fibonacci sphere by index), levels/xp/series seeded.

## Tasks

### Task 1 - Foundation: types, domains, data, sim provider
Files: `src/lib/command/{types.ts,domains.ts,data.ts,use-sim.tsx,seed.ts}`.
- Implement the contracts above. `seed.ts` = small deterministic noise/series helpers.
- `domains.ts`: the 12 domains with tasteful multi-color assignment from the intelbase palette
  (blue #6ea8ff, mint #7df5c8, violet #b79cff, amber #ffb86b, pink #ff8fb1, cyan #67e8f9, plus
  a couple tints) and a lucide icon name each.
- Verify: a tiny temporary check or just `npm run build` (controller builds). Commit.

### Task 2 - Shell chrome (route + command-app + rail + tabs/HUD + feed + command bar + detail panel)
Files: `src/app/command/page.tsx`, `src/components/command/command-app.tsx`,
`src/components/command/{domain-rail,top-tabs,hud,live-feed,command-bar,detail-panel}.tsx`,
`src/components/command/command.css`.
- `command-app.tsx` (`"use client"`): wraps everything in the sim provider; lays out the shell:
  top bar (brand "Intelbase" + view tabs + HUD counters), left domain rail, center stage
  (PLACEHOLDER `<div className="cmd-stage-placeholder">constellation</div>` for now), a live
  feed column, a bottom command bar, and a right detail panel that shows when `selected` is set.
  Keyboard: keys 1-6 switch view; Esc clears selection.
- Domain rail: 12 domains as glowing icon+label buttons; active one themed; click toggles
  `activeDomain`.
- Top tabs + HUD: the 6 views as tabs (active underline/glow), MRR/Leads/Tasks/Uptime counters
  (mono, ticking from sim).
- Live feed: newest-first `feed` events with domain color dot, tag, text, mono timestamp,
  framer-motion enter.
- Detail panel: given `selected` node, show icon, label, kind/domain, level+XP bar, status,
  metric + sparkline, queue list, connections (count), action buttons (Focus, Pause, Inspect).
- command.css: the full dark Jarvis HUD chrome (near-black #05060b, glows, thin rings, mono
  telemetry). Near-blackish, premium.
- Verify (controller): build + Playwright screenshot at 1920x1080: chrome renders, feed
  streams, counters tick, clicking a temporary stage does nothing yet. Commit.

### Task 3 - The constellation (HERO)
Files: `src/components/command/constellation/{constellation.tsx,projection.ts,nodes.tsx,strands.tsx,particles.tsx}`,
`src/components/command/constellation/constellation.css`. Mount `<Constellation/>` in
command-app's center stage (replace the placeholder).
- `projection.ts`: camera state (azimuth, elevation, zoom) + `project(pos, cam, w, h)` ->
  `{x,y,scale,depth}` perspective projection; helpers to rotate.
- `constellation.tsx` (`"use client"`): a sized container; rAF or sim-`t` driven re-render of
  projected positions; pointer-drag rotates the camera, wheel zooms; renders (back-to-front by
  depth): particles canvas, strands SVG, node tiles DOM. Hover highlights a node + its links +
  tooltip; click sets `selected` and eases camera toward that node.
- `nodes.tsx`: each node = a glowing rounded-square icon tile (domain color, lucide icon),
  label below, a tiny sparkline; size/opacity scale with depth; the core is larger and pulses;
  `firing` nodes flash + ring. 
- `strands.tsx`: SVG bezier links between projected endpoints; animated traveling pulse dots
  along active links (esp. firing ones); opacity by depth; highlight the selected/hovered
  node's links.
- `particles.tsx`: a canvas starfield/motes drifting for ambiance and depth.
- domain filter: when `activeDomain` is set, dim non-matching clusters and pull the active
  cluster forward.
- Verify (controller): Playwright screenshots while dragging/selecting; confirm 50+ glowing
  nodes, strands with pulses, depth, hover/click works. This is the look-check gate. Commit.

### Task 4 - Boot sequence + command palette + final polish
Files: `src/components/command/boot-sequence.tsx`, `src/components/command/command-palette.tsx`,
edits to `command-app.tsx` + `command.css`.
- `boot-sequence.tsx`: a full-screen overlay that plays the chained boot (~7-9s): (1) mono boot
  log lines type in with a progress arc; (2) a CSS/SVG wireframe core spins up at center; (3)
  faux "regions ignite" pulses; (4) the constellation behind it "assembles" (fade/scale the
  real constellation in) ; (5) the overlay dissolves (fade + slight zoom) into the live
  dashboard. A Skip button and a Replay control (for recording takes). Drive with framer-motion
  timelines / a local clock.
- `command-palette.tsx`: cmd-K overlay; fuzzy list of nodes + domains + views; selecting jumps
  (setView/setActiveDomain/setSelected). Esc closes.
- Wire into command-app: show boot on first mount, then the dashboard; cmd-K toggles palette.
- Verify (controller): Playwright capture the boot frames + final dashboard; build. Commit.

## Verification model
No test runner (fork-sensitive). Gate each task on `npm run build` + Playwright 1920x1080
screenshots that the controller reviews. Determinism is NOT required (interactive prototype),
so real time/RAF motion is fine.

## Out of scope for Phase 1 (later phases)
Brain (WebGL neural) tab, Deck/Team/Usage/Settings tab CONTENT (tabs can switch but show a
tasteful "coming online" placeholder in Phase 1), deterministic capture mode.
