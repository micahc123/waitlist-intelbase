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
