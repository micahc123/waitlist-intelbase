# Lead-Gen Growth Systems (GROW-01..07)

> Six growth systems that **extend** the core intelbase outbound engine, each built to the "press go"
> point: strategy, config, and templates only. **Nothing was purchased, signed, or sent, and no git
> command was run.** Everything that costs money or needs a credential is a hand-back, consolidated at
> the bottom of this file so it folds into the master HANDBACK. No em dashes throughout.

## How these extend the core lead engine

The core engine in `../` is a single channel: Apollo ICP into verified cold email into a Cal.com
booked call, all in one CRM and one dashboard (`../README.md`, `../ICP_AND_APOLLO_SEARCH.md`,
`../BOOKING_AND_CRM.md`). These six systems do not replace or contradict it; they add more roads to
the same destination. They reuse the **same ICP** (LinkedIn, voice), the **same ad creatives and
pixel** (retargeting), intelbase's **own first-party list** (reactivation), **WhatsApp** as the HK/Asia
channel, and **other people's client bases** (partners). Critically, every one of them books onto the
**same Cal.com event**, tags the **same master CRM** with a `source`, and surfaces in the **same one
dashboard**, so "booked calls this week" stays a single honest number no matter how many channels feed
it. Each system is also intelbase dogfooding a sellable intelbase OS module (Reactivation Engine, AI
Voice Receptionist, AI Ad Engine, multilingual front desk), so running them is also proof for the
pitch.

## Index

| File | Requirement | What it covers |
|------|-------------|----------------|
| [01-visitor-retargeting.md](./01-visitor-retargeting.md) | GROW-01 | Meta retargeting for visitors who engaged the concierge but did not book. Audience definitions, the `ConciergeEngaged`/`ConciergeBooked` custom pixel events to add (hand-back to the src agent), ad angles reusing `marketing/meta-ads-v2.md`, budget, and Meta press-go steps. |
| [02-reactivation.md](./02-reactivation.md) | GROW-02 | Reactivate intelbase's own past leads/contacts from the prior offer. Segmentation (S1–S4), a 3-step "we do something new now" email + WhatsApp sequence (full copy), list hygiene/consent notes, and routing into the same funnel. |
| [03-ai-voice-outbound.md](./03-ai-voice-outbound.md) | GROW-03 | Outbound AI voice calling that books discovery calls, dogfooding the AI Voice Receptionist. Provider options + costs (Vapi/Bland/Retell), call script and flow with hard guardrails, HK + general compliance, and press-go steps. |
| [04-linkedin-outbound.md](./04-linkedin-outbound.md) | GROW-04 | Multi-account LinkedIn outbound on the same Apollo ICP, alongside the cold-email engine. Tool options + costs (HeyReach/Expandi), connection + message sequences (two variants, full copy), daily limits/safety, press-go steps. |
| [05-whatsapp-broadcast.md](./05-whatsapp-broadcast.md) | GROW-05 (strategy) | WhatsApp broadcast + opt-in for HK/Asia, referencing the inbound concierge webhook built in code separately. Opt-in mechanics, Cloud API + template-approval notes, broadcast template copy, compliance, press-go steps. |
| [06-partner-referral.md](./06-partner-referral.md) | GROW-07 | Partner/referral program to white-label intelbase OS via agencies, dev shops, and consultants. Ideal partner profile, offer + revenue-share options, recruitment outreach copy, a simple tracking sheet approach, press-go steps. |

## Cross-system rules (apply to all six)

1. **One calendar:** every channel books the same Cal.com event (`../BOOKING_AND_CRM.md`).
2. **One CRM, source-tagged:** tag `source =` (retargeting / reactivation / voice / linkedin / whatsapp
   / partner) so each channel is countable separately while still totaling to one "booked calls" number.
3. **One suppression list:** an opt-out on any channel suppresses the contact on all channels,
   permanently.
4. **Same ICP for cold channels:** LinkedIn and voice pull from the Apollo Saved Searches A/B/C; do not
   invent new targeting.
5. **Warm before cold:** reactivation, retargeting, and warm voice/partner outreach come first; they
   are cheaper, safer, and book faster than cold expansion.
6. **Budget discipline:** all tooling stays within the ~10k HKD/mo ceiling across the whole stack
   (core engine + these systems). Paid media spend (retargeting) is separate from tooling; size it
   against cash, not the tooling ceiling.

---

## PRESS GO additions (consolidated, for the master HANDBACK)

Ordered across all six systems. **Nothing below was executed.** Every line needs your account, money,
or credentials. Costs are list-price USD estimates with HKD context (~7.8 HKD/USD); **confirm at
purchase** and keep total **tooling** within ~10,000 HKD/mo across the entire stack. Paid ad media
(retargeting, click-to-WhatsApp) is separate spend you size against cash. Do warm/cheap systems first.

### Tier 0 - Free or near-free, do first (warm channels)

1. **Reactivation (GROW-02)** - cost: ~US$0 tooling (uses the existing MillionVerifier + a warm
   mailbox or the existing Smartlead on a warm profile). Export past contacts, segment S1–S4, strip
   opt-outs, verify emails, send the 3-step sequence. Route bookings with a `reactivation` UTM.
2. **Visitor retargeting pixel wiring (GROW-01)** - cost: US$0 (pixel is free). **Hand-back to the
   src agent:** add `ConciergeEngaged` and `ConciergeBooked` custom events to the concierge. Then
   build Meta Custom Audiences R1–R4. (Ad spend is Tier 3.)

### Tier 1 - Low-cost tooling (the channel engines)

3. **LinkedIn outbound (GROW-04)** - **HeyReach** ~US$79/mo + optional **Sales Navigator** ~US$99/mo
   per account. Start 1 to 2 real, warmed accounts. Launch ~US$79–180/mo (~615–1,400 HKD/mo).
4. **AI voice outbound (GROW-03)** - **Vapi or Bland** usage-based (~US$0.05–0.15/min) + one phone
   number (~US$1–5/mo). Budget ~US$50–150/mo of calling at low volume (~390–1,170 HKD/mo). Start with
   warm leads only.

### Tier 2 - Permission-gated channel (needs approvals)

5. **WhatsApp broadcast (GROW-05)** - **WhatsApp Business Platform / Cloud API** via Meta or a BSP
   (Twilio / 360dialog / Wati). Platform fee ~US$0–100+/mo + per-conversation pricing (varies by
   country/category; confirm for HK/target markets). Register and verify the number, submit templates
   A/B/C for approval, build opt-in capture. Coordinate the inbound concierge webhook with the src
   team (do not edit it). Roughly ~US$0–100/mo + usage (~0–780 HKD/mo + per-conversation).

### Tier 3 - Paid media (separate from tooling, size against cash)

6. **Meta retargeting ad spend (GROW-01)** - after the pixel events are firing, run audiences R1 + R2
   at ~US$8–13/day (~250–390/mo, ~1,950–3,000 HKD/mo of **ad spend**). Reuse `marketing/meta-ads-v2.md`
   creatives. Scale only when cost-per-booked-call is acceptable. Optional: click-to-WhatsApp ads feed
   GROW-05.

### Tier 4 - Process setup (no recurring tool cost)

7. **Partner / referral program (GROW-07)** - cost: ~US$0 to launch (a tracking sheet + per-partner
   UTM/Cal.com links + a one-page agreement). Pick referral vs white-label structure and the share,
   recruit warm partners first. Add a referral tool (Rewardful/PartnerStack) only if volume demands it.

### Consolidated tooling-cost snapshot (launch, lean)

| System | Launch tooling US$/mo | HKD/mo (~7.8) | Notes |
|--------|-----------------------|---------------|-------|
| GROW-02 Reactivation | ~0 | ~0 | Reuses existing verifier + warm mailbox |
| GROW-01 Retargeting (pixel) | 0 | 0 | Pixel free; ad spend is Tier 3 |
| GROW-04 LinkedIn | ~79–180 | ~615–1,400 | HeyReach + optional Sales Nav |
| GROW-03 Voice | ~50–150 | ~390–1,170 | Usage-based, warm leads first |
| GROW-05 WhatsApp | ~0–100 + usage | ~0–780 + usage | BSP fee + per-conversation |
| GROW-07 Partner | ~0 | ~0 | Sheet + agreement |
| **Growth tooling subtotal** | **~129–430 + usage** | **~1,005–3,350 + usage** | On top of core engine (~181/mo launch) |

Core engine launch (~US$181/mo, ~1,415 HKD/mo from `../STACK_AND_BUDGET.md`) **plus** the growth
tooling subtotal still lands **comfortably under the 10,000 HKD/mo ceiling** at lean launch. Add the
heavier lines (more LinkedIn accounts, more voice minutes, paid retargeting) only as channels prove
they book calls, and keep the running total under the ceiling.

### Press-go gates (do not skip)

- **Retargeting:** do not scale spend until `ConciergeEngaged`/`ConciergeBooked` fire correctly.
- **Voice:** do not dial real prospects until guardrails are verified live (it must refuse to invent a
  price and hand off when unsure) and the market's voice rules are confirmed.
- **LinkedIn:** do not automate unwarmed accounts; ramp from week-1 limits only after a healthy week.
- **WhatsApp:** do not broadcast until templates are approved, opt-in is recorded per recipient, and a
  test batch rendered correctly.
- **Reactivation:** do not send until the list is de-duped against opt-outs, verified, and the opt-out
  path is tested.
- **Partner:** do not promise a share unchecked against margins; have the agreement and tracking link
  ready before recruiting.

## Safety statement

No tool, account, number, domain, ad, or API was purchased or provisioned. No email, WhatsApp message,
LinkedIn request, or voice call was sent or placed. No pixel event, audience, or template was created.
No list was uploaded or verified. The inbound WhatsApp concierge webhook and all `src/` code were left
untouched (the src agent owns those; the only code-side item is a hand-back to add two custom pixel
events). No credentials were used. **No git command was run.** All files were written only into
`lead-gen/systems/`. Everything that costs money or needs a credential is in the PRESS GO additions
above, for folding into the master HANDBACK.
