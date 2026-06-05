// Typed wrapper around the Meta Pixel `fbq` global.
// Use these helpers from button onClick handlers, they no-op safely on the server
// and before the Pixel script has finished loading.

type StandardEvent =
  | "PageView"
  | "Lead"
  | "Schedule"
  | "Contact"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "Purchase"
  | "ViewContent";

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: EventParams) => void;
  }
}

export function trackEvent(event: StandardEvent | string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

/**
 * Fire a CUSTOM (non-standard) Pixel event. Use `trackCustom` so Meta records it
 * as a custom event rather than trying to match it to a standard event. No-ops
 * safely on the server and before the Pixel script has loaded.
 */
export function trackCustomEvent(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("trackCustom", event, params);
}

/**
 * GROW-01 retargeting hook. Fire ONCE when a visitor engaged the concierge (sent
 * at least one message) but left without booking a call. The Ad Engine builds a
 * retargeting audience from this custom event.
 *
 * Audience rule (documented in src/lib/agent/LEAD_SYSTEMS.md):
 *   Include = people who fired `ConciergeAbandoned` in the last 30 days,
 *   Exclude = people who fired the standard `Lead`/`Schedule` events (they booked).
 *
 * Resilient by design: it no-ops if the Pixel is absent, so the chat never breaks.
 */
export const trackConciergeAbandoned = (turns?: number) =>
  trackCustomEvent("ConciergeAbandoned", {
    content_name: "concierge_no_booking",
    ...(typeof turns === "number" ? { turns } : {}),
  });

/** Fire on cal.com CTA clicks, upper-funnel optimization signal. */
export const trackLead = () => trackEvent("Lead", { content_name: "discovery_call_cta" });

/** Fire on WhatsApp CTA clicks, separate funnel from booked calls. */
export const trackContact = () => trackEvent("Contact", { content_name: "whatsapp_cta" });
