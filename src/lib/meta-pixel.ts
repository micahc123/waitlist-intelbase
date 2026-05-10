// Typed wrapper around the Meta Pixel `fbq` global.
// Use these helpers from button onClick handlers — they no-op safely on the server
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

/** Fire on cal.com CTA clicks — upper-funnel optimization signal. */
export const trackLead = () => trackEvent("Lead", { content_name: "discovery_call_cta" });

/** Fire on WhatsApp CTA clicks — separate funnel from booked calls. */
export const trackContact = () => trackEvent("Contact", { content_name: "whatsapp_cta" });
