"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { GraphNode, Link, Domain, DomainId, ViewId, FeedEvent } from "./types";
import { DOMAINS } from "./domains";
import { buildGraph } from "./data";
import { seededRand } from "./seed";

// ---------------------------------------------------------------------------
// Feed event templates per domain
// ---------------------------------------------------------------------------

const FEED_TEMPLATES: Record<DomainId, Array<{ tag: string; text: (label: string) => string }>> = {
  leadgen: [
    { tag: "Lead", text: (l) => `New lead scored from ${l} campaign` },
    { tag: "Qualify", text: (l) => `${l} qualified 3 new contacts` },
    { tag: "Import", text: (l) => `${l} imported 12 leads from ad click` },
    { tag: "Score", text: (l) => `Lead score updated for ${l} batch` },
  ],
  outreach: [
    { tag: "Sent", text: (l) => `${l} dispatched sequence step 2` },
    { tag: "Reply", text: (l) => `Reply detected from ${l} thread` },
    { tag: "Paused", text: (l) => `${l} paused sequence - no reply 7d` },
    { tag: "Draft", text: (l) => `${l} drafted new intro message` },
  ],
  pipeline: [
    { tag: "Stage", text: (l) => `${l} advanced deal to proposal stage` },
    { tag: "Stale", text: (l) => `${l} flagged 2 stale deals for nurture` },
    { tag: "Value", text: (l) => `${l} updated deal value estimate` },
    { tag: "Close", text: (l) => `${l} moved deal to closing stage` },
  ],
  engagement: [
    { tag: "Reply", text: (l) => `${l} replied to 6 comments` },
    { tag: "DM", text: (l) => `${l} handled 3 new inbox messages` },
    { tag: "Like", text: (l) => `${l} liked 14 story mentions` },
    { tag: "Flag", text: (l) => `${l} flagged urgent message for review` },
  ],
  followups: [
    { tag: "Sent", text: (l) => `${l} sent day-5 follow-up sequence` },
    { tag: "Reactivate", text: (l) => `${l} re-engaged 30d silent contact` },
    { tag: "Log", text: (l) => `${l} logged reply from prospect` },
    { tag: "Update", text: (l) => `${l} updated nurture sequence status` },
  ],
  content: [
    { tag: "Draft", text: (l) => `${l} drafted new carousel post` },
    { tag: "Schedule", text: (l) => `${l} scheduled 3 posts for next week` },
    { tag: "Publish", text: (l) => `${l} published reel to IG` },
    { tag: "Approve", text: (l) => `${l} sent content for client approval` },
  ],
  systems: [
    { tag: "Health", text: (l) => `${l} passed system health check` },
    { tag: "Config", text: (l) => `${l} updated integration config` },
    { tag: "Alert", text: (l) => `${l} resolved webhook timeout` },
    { tag: "Seat", text: (l) => `${l} onboarded new team seat` },
  ],
  finance: [
    { tag: "Invoice", text: (l) => `${l} sent invoice for retainer` },
    { tag: "Payment", text: (l) => `${l} confirmed payment received` },
    { tag: "Overdue", text: (l) => `${l} flagged overdue invoice` },
    { tag: "Report", text: (l) => `${l} generated monthly revenue report` },
  ],
  ops: [
    { tag: "Call", text: (l) => `${l} handled inbound call` },
    { tag: "Route", text: (l) => `${l} routed inquiry to correct agent` },
    { tag: "Log", text: (l) => `${l} logged voicemail summary` },
    { tag: "Schedule", text: (l) => `${l} booked callback for tomorrow` },
  ],
  recovery: [
    { tag: "Win-Back", text: (l) => `${l} sent win-back offer to churned client` },
    { tag: "Re-Engage", text: (l) => `${l} re-engaged 45d silent account` },
    { tag: "Discount", text: (l) => `${l} applied reactivation discount` },
    { tag: "Recovered", text: (l) => `${l} recovered HK$4,200 in revenue` },
  ],
  data: [
    { tag: "Sync", text: (l) => `${l} synced 24h contact updates` },
    { tag: "Dedupe", text: (l) => `${l} reconciled 8 duplicate records` },
    { tag: "Export", text: (l) => `${l} exported weekly data CSV` },
    { tag: "Tag", text: (l) => `${l} applied segment tags to contacts` },
  ],
  automation: [
    { tag: "Trigger", text: (l) => `${l} triggered onboarding workflow` },
    { tag: "Retry", text: (l) => `${l} retried failed webhook step` },
    { tag: "Batch", text: (l) => `${l} scheduled next-week task batch` },
    { tag: "Complete", text: (l) => `${l} completed 47 automation tasks` },
  ],
};

// ---------------------------------------------------------------------------
// Sim interface
// ---------------------------------------------------------------------------

export interface Sim {
  t: number;
  nodes: GraphNode[];
  links: Link[];
  domains: Domain[];
  activeDomain: DomainId | null;
  setActiveDomain: (d: DomainId | null) => void;
  view: ViewId;
  setView: (v: ViewId) => void;
  selected: string | null;
  setSelected: (id: string | null) => void;
  feed: FeedEvent[];
  counters: { mrr: number; leads: number; tasks: number; uptimeSec: number };
  firing: Set<string>;
  paused: boolean;
  setPaused: (b: boolean) => void;
  speed: number;
  setSpeed: (n: number) => void;
}

const SimContext = createContext<Sim | null>(null);

// ---------------------------------------------------------------------------
// SimProvider
// ---------------------------------------------------------------------------

export function SimProvider({ children }: { children: React.ReactNode }) {
  // Graph is stable - built once
  const { nodes, links } = useMemo(() => buildGraph(), []);

  // Lightweight tick for consumers that need smooth re-renders
  const [tick, setTick] = useState(0);

  // UI state
  const [activeDomain, setActiveDomain] = useState<DomainId | null>(null);
  const [view, setView] = useState<ViewId>("agents");
  const [selected, setSelected] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Simulation state (refs for rAF loop, also reflected in committed state)
  const tRef = useRef(0);
  const pausedRef = useRef(false);
  const speedRef = useRef(1);
  const lastFeedFireRef = useRef(0);
  const firingTimeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastCommitRef = useRef(0);
  const lastCounterUpdateRef = useRef(0);

  // Committed state for consumers
  const [tState, setTState] = useState(0);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [firing, setFiring] = useState<Set<string>>(new Set());
  const [counters, setCounters] = useState({
    mrr: 528000,
    leads: 3700,
    tasks: 72000,
    uptimeSec: 0,
  });

  // Keep refs in sync with state
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // rAF loop
  useEffect(() => {
    let rafId: number;
    let lastWallTime: number | null = null;
    let feedEventCounter = 0;

    function frame(wallTime: number) {
      rafId = requestAnimationFrame(frame);

      if (lastWallTime === null) {
        lastWallTime = wallTime;
        return;
      }

      const dt = Math.min((wallTime - lastWallTime) / 1000, 0.1); // cap at 100ms
      lastWallTime = wallTime;

      if (!pausedRef.current) {
        tRef.current += dt * speedRef.current;
      }

      const now = performance.now();
      const t = tRef.current;

      // Commit t state ~30fps (every ~33ms)
      if (now - lastCommitRef.current >= 33) {
        lastCommitRef.current = now;
        setTState(t);
        setTick((prev) => prev + 1);
      }

      // Fire events every ~0.6s / speed (sim-time)
      if (!pausedRef.current && t - lastFeedFireRef.current >= 0.6 / speedRef.current) {
        lastFeedFireRef.current = t;

        // Pick a random node by seeded selection based on event counter
        const seed = Math.floor(t * 100) + feedEventCounter;
        const idx = Math.floor(seededRand(seed) * nodes.length);
        const node = nodes[idx];
        feedEventCounter += 1;

        if (node) {
          // Mark as firing
          const nodeId = node.id;
          const existingTimeout = firingTimeoutMap.current.get(nodeId);
          if (existingTimeout) clearTimeout(existingTimeout);

          setFiring((prev) => {
            const next = new Set(prev);
            next.add(nodeId);
            return next;
          });

          const timeout = setTimeout(() => {
            setFiring((prev) => {
              const next = new Set(prev);
              next.delete(nodeId);
              return next;
            });
            firingTimeoutMap.current.delete(nodeId);
          }, 500);
          firingTimeoutMap.current.set(nodeId, timeout);

          // Generate feed event
          const templates = FEED_TEMPLATES[node.domain];
          const tIdx = Math.floor(seededRand(seed + 1) * templates.length);
          const tpl = templates[tIdx];
          const eventId = `evt-${feedEventCounter}-${nodeId}`;
          const event: FeedEvent = {
            id: eventId,
            t,
            domain: node.domain,
            tag: tpl.tag,
            text: tpl.text(node.label),
          };

          setFeed((prev) => [event, ...prev].slice(0, 40));
        }
      }

      // Update counters every ~5 real seconds
      if (now - lastCounterUpdateRef.current >= 5000) {
        lastCounterUpdateRef.current = now;
        if (!pausedRef.current) {
          const elapsed = now / 1000;
          setCounters((prev) => ({
            mrr: Math.round(528000 + elapsed * speedRef.current * 0.4),
            leads: Math.round(3700 + elapsed * speedRef.current * 0.08),
            tasks: Math.round(72000 + elapsed * speedRef.current * 1.2),
            uptimeSec: Math.round(elapsed),
          }));
        }
      }
    }

    rafId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(rafId);
      // Clean up any firing timeouts
      firingTimeoutMap.current.forEach((tid) => clearTimeout(tid));
    };
  }, [nodes]);

  const value: Sim = {
    t: tState,
    nodes,
    links,
    domains: DOMAINS,
    activeDomain,
    setActiveDomain: useCallback((d: DomainId | null) => setActiveDomain(d), []),
    view,
    setView: useCallback((v: ViewId) => setView(v), []),
    selected,
    setSelected: useCallback((id: string | null) => setSelected(id), []),
    feed,
    counters,
    firing,
    paused,
    setPaused: useCallback((b: boolean) => setPaused(b), []),
    speed,
    setSpeed: useCallback((n: number) => setSpeed(n), []),
  };

  // tick is consumed implicitly via tState / counters / feed / firing updates
  void tick;

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSim(): Sim {
  const ctx = useContext(SimContext);
  if (!ctx) {
    throw new Error("useSim must be used within a SimProvider");
  }
  return ctx;
}
