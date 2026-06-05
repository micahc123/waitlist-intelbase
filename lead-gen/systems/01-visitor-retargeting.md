# 01 - Visitor Retargeting (GROW-01)

> Meta retargeting funnel for site visitors who engaged the intelbase concierge but did not book a
> call. Reuses the existing Meta Pixel (`src/lib/meta-pixel.ts`) and the ad creatives in
> `marketing/meta-ads-v2.md`. Goal: pull warm, half-convinced visitors back to the calendar.
> No em dashes. Nothing here was purchased or launched; it is build-to-press-go.

## 1. Why this exists

The website concierge answers every visitor and tries to book the call. Most visitors who chat will
not book on the first visit. Today that intent is lost. This system catches it: anyone who engaged
the chat and left without booking gets retargeted on Meta with the same ad angles, pulling them back
to the same Cal.com calendar the rest of the funnel uses (see `../BOOKING_AND_CRM.md`).

This is the **AI Ad Engine** capability (POS-03 item 4) and the **Reactivation** logic applied to
paid retargeting. It runs alongside, not instead of, the cold-email engine.

## 2. The pixel event to target (coordinate with the site code)

The site already loads the Meta Pixel and fires (see `src/lib/meta-pixel.ts`):

| Existing event | When it fires | Use here |
|----------------|---------------|----------|
| `PageView` | Every page load (base pixel) | Broad site-visitor audience (weak intent) |
| `Lead` (`content_name: discovery_call_cta`) | Cal.com booking CTA click | **Exclusion** signal (they reached booking) |
| `Contact` (`content_name: whatsapp_cta`) | WhatsApp CTA click | Secondary intent, route to WhatsApp funnel (see `05-whatsapp-broadcast.md`) |

**What is missing and must be added (hand-back to the src agent):** a custom event that fires when a
visitor **engages the concierge but has not booked**. Define it as:

```
ConciergeEngaged   (custom event)
  params: { engaged: true, booked: false, messages: <count> }
```

Fire `ConciergeEngaged` once per session after the visitor sends their **second** chat message (a
real conversation, not an accidental open). Do **not** fire it if the same session later fires `Lead`
(booking CTA) or completes a booking. Add a matching `ConciergeBooked` custom event on a confirmed
booking so the audience can exclude true conversions cleanly.

`src/lib/meta-pixel.ts` already supports arbitrary custom events via
`trackEvent(event: StandardEvent | string, params?)`. The src agent only needs to call:

```ts
// pseudo - to be wired by the src agent in the concierge component, do not edit src from here
trackEvent("ConciergeEngaged", { engaged: true, booked: false, messages: count });
// on confirmed booking:
trackEvent("ConciergeBooked", { booked: true });
```

Until that event exists, fall back to a weaker proxy audience: "all website visitors (PageView) in
last 30 days, excluding `Lead` and `Schedule` events." It works but wastes spend on no-intent
traffic, so prioritize getting `ConciergeEngaged` wired.

## 3. Audience definitions (build in Meta Events Manager / Ads Manager)

Build these as **Custom Audiences** (Website source), then layer exclusions.

### Audience R1 - Concierge engaged, did not book (primary)
- **Include:** people who triggered `ConciergeEngaged` in the last **30 days**.
- **Exclude:** anyone who triggered `ConciergeBooked` or `Lead` or `Schedule` in the last 90 days.
- **Exclude:** existing customers list (uploaded), open CRM leads (uploaded).
- This is the money audience: highest intent, clearest "almost booked" signal.

### Audience R2 - Engaged, did not book, 7-day hot window
- Same as R1 but window = **7 days**. Highest urgency, gets the strongest "book now" ad and the
  top bid. Use to front-load budget on freshest intent.

### Audience R3 - Site visitors, no chat (broad warm)
- **Include:** `PageView` in last 30 days.
- **Exclude:** `ConciergeEngaged` (they are in R1), `Lead`, `Schedule`, customers, open leads.
- Lower intent. Lower budget. Lighter, curiosity-led creative.

### Audience R4 - WhatsApp clickers, no book
- **Include:** `Contact` (`whatsapp_cta`) in last 30 days.
- **Exclude:** `ConciergeBooked`, `Lead`, `Schedule`.
- Cross-route: prefer the WhatsApp broadcast funnel (`05-whatsapp-broadcast.md`) for these, but a
  light Meta retarget reinforces it.

### Suppression / exclusion list (apply to every audience)
- Customers (uploaded customer-match list).
- Anyone who booked a call in the last 60 days.
- Open CRM leads already in an active sequence (avoid double-touch fatigue).
- Job seekers and your own team / page admins.

## 4. Ad angles (reuse the existing creatives)

Map the five ads in `marketing/meta-ads-v2.md` to retargeting intent. Retargeting copy can be
shorter and more direct than cold, because they already know who intelbase is.

| Audience | Primary ad | Why | Secondary / rotation |
|----------|-----------|-----|----------------------|
| R1 (engaged, no book) | **Ad 3 - Stop babysitting Ads Manager** | They engaged about doing it themselves; reframe to "we run it for you" | Ad 5 (direct, book a call) |
| R2 (7-day hot) | **Ad 5 - Direct and blunt** | Highest intent, just ask for the call plainly | Ad 1 (replace the stack) |
| R3 (broad warm) | **Ad 4 - One system, not five tools** | Curiosity / category education for lower intent | Ad 2 (stale creative) |
| R4 (WhatsApp clickers) | **Ad 5 - Direct** | Already reached out once, close the loop | Ad 3 |

**Retargeting-specific copy tweak (optional, add as variants in Ads Manager, do not edit the source
file):** open with recognition, for example "Still weighing it up?" or "You looked at intelbase. Here
is the 60-second version." Keep the dogfood proof line: "the chat you talked to is the product."
Single CTA: **Book a free call**, pointing at the same Cal.com link as everything else.

**Format mix:** lead with single-image and short video (under 15s) of the dashboard / live chat.
Reuse Higgsfield-generated creative from the Ad Engine. Test 3 to 5 creatives per audience, rotate
winners before fatigue (retargeting pools are small and fatigue fast).

## 5. Budget guidance (within the 10k HKD/mo ceiling)

Retargeting audiences are small, so spend stays low by design. Keep total Meta retargeting spend
modest so it sits comfortably inside the overall budget alongside the rest of the stack.

| Audience | Suggested daily | US$/mo | Notes |
|----------|-----------------|--------|-------|
| R1 (engaged, no book) | US$5–8/day | ~150–240 | Primary. Most of the budget. |
| R2 (7-day hot) | US$3–5/day | ~90–150 | Highest ROI per impression, small pool. |
| R3 (broad warm) | US$2–4/day | ~60–120 | Only run once R1/R2 are saturated. |
| R4 (WhatsApp) | US$1–2/day | ~30–60 | Light reinforcement. |

**Launch recommendation:** start with **R1 + R2 only at ~US$8–13/day total (~250–390/mo, ~1,950–
3,000 HKD/mo)**. This is paid media spend, separate from the tooling stack in `../STACK_AND_BUDGET.md`.
Decide the media budget against your own cash, not the tooling ceiling, but keep the *tooling* total
(Meta has no tool cost beyond the pixel, which is free) within ~10k HKD/mo across all systems. Scale
R1 only when cost-per-booked-call from retargeting is acceptable.

- **Objective:** Sales / Leads, optimizing for the `ConciergeBooked` or `Schedule` event (or
  `Lead`/booking CTA click until enough conversions exist, then switch to the booking event).
- **Bid:** lowest-cost / highest-volume to start; move to cost-cap once you know your acceptable
  cost per booked call.
- **Frequency cap:** cap at roughly 3 to 4 impressions per person per week. Retargeting pools are
  small; over-showing burns goodwill.

## 6. Measurement

- North-star: **booked calls attributed to retargeting** (Cal.com "how did you hear" + UTM on the
  booking link, see `../BOOKING_AND_CRM.md`).
- Use a distinct booking URL or UTM for retargeting ads (for example `?utm_source=meta&utm_medium=
  retargeting&utm_campaign=concierge_r1`) so these calls are countable separately in the one
  dashboard.
- Watch: cost per booked call, frequency, CTR, audience size (if R1 drops below ~300 people, pause
  R3/R4 and concentrate spend).

## 7. PRESS GO steps (Meta)

Nothing below was executed. Each step needs your Meta account and ad spend.

1. **Confirm the pixel is live and verified** in Meta Events Manager (the base pixel already exists
   in the site). Check `PageView`, `Lead`, `Contact` are received.
2. **Hand-back to the src agent:** add the `ConciergeEngaged` and `ConciergeBooked` custom events to
   the concierge component (section 2). Verify in Events Manager Test Events that they fire.
3. **Set up the Conversions API (optional but recommended)** for the booking event so iOS/ad-blocker
   loss is reduced. This is a server-side hand-back; defer if launching lean.
4. **Build Custom Audiences R1–R4** in Ads Manager Audiences (section 3), with the exclusions.
5. **Upload suppression lists** (customers, open leads) as Customer-Match audiences and add them to
   every exclusion.
6. **Create the campaign:** objective = Leads/Sales, one ad set per audience, creatives mapped per
   section 4, budgets per section 5, frequency cap set.
7. **Point all ad CTAs at the same Cal.com link** with the retargeting UTM (section 6).
8. **Turn on R1 + R2 only.** Let it run 7 to 10 days before judging. Add R3/R4 once R1/R2 are stable.
9. **Review weekly:** booked calls from retargeting, cost per booked call, frequency. Rotate creative
   before fatigue.

**Press-go gate:** do not scale spend until `ConciergeEngaged`/`ConciergeBooked` are firing
correctly and at least a handful of conversions have been recorded. Optimizing on a broken event
wastes money.

## 8. Safety

No ad was created, no audience built, no budget spent, no pixel event added by this document. The
custom-event wiring is a hand-back to the agent editing `src/`. No git command was run.
