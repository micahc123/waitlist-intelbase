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
