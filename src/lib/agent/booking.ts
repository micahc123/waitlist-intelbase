// AGENT-03: Booking. When a visitor is qualified (or the agent hands off), surface
// a booking action. Uses a configurable BOOKING_URL env, falling back to the
// site's existing Book-a-call CTA (cal.com link used across the site).
// Framework-agnostic. No 'next' import.

import type { BookingAction, LeadQualification } from "./types";

// Same cal.com link the rest of the site uses (src/app/page.tsx CAL_URL).
// Kept here so the agent stays consistent with the site even if env is unset.
const DEFAULT_BOOKING_URL = "https://cal.com/intelbase/discovery-call";

const DEFAULT_LABEL = "Book a free call";

// Reads BOOKING_URL at call time so a deploy can override without a code change.
export function getBookingUrl(): string {
  const fromEnv =
    typeof process !== "undefined" ? process.env.BOOKING_URL : undefined;
  const url = fromEnv?.trim();
  return url && url.length > 0 ? url : DEFAULT_BOOKING_URL;
}

// Returns a booking action when one should be surfaced, else null.
// Surface booking when the visitor is qualified, OR when the agent is handing off
// (so a low-confidence / out-of-scope answer still routes to a real call).
export function resolveBooking(
  qualification: LeadQualification,
  handoff: boolean
): BookingAction | null {
  const qualified = Boolean(qualification.qualified);
  if (!qualified && !handoff) return null;

  return {
    label: DEFAULT_LABEL,
    url: getBookingUrl(),
    reason: qualified ? "qualified" : "handoff",
  };
}
