# Stack and Budget (LEAD-01)

> The concrete outbound tooling stack for intelbase's Apollo-based lead-gen engine selling
> **intelbase OS**. Goal: maximize booked client calls. Budget ceiling: **10,000 HKD/month**
> (about US$1,280/mo at ~7.8 HKD per USD). All costs below are list-price estimates in USD.
> **Confirm current pricing at purchase.** Nothing here was bought; this is a plan to "press go."

## Design principle

Modern deliverability-safe cold outbound is not "one inbox blasting thousands." It is:

**data -> verification -> many warmed inboxes across many domains -> sequencing -> booking**

You never send volume from your primary domain. You spread a modest daily volume across several
secondary domains and many inboxes, warm them first, and verify every address before sending. This
stack buys exactly those pieces and nothing more.

## The stack

| # | Role | Tool (chosen / options) | Plan | US$/mo | Notes |
|---|------|------------------------|------|--------|-------|
| 1 | Lead data + sequencing engine | **Apollo.io** | Basic or Professional | 49–99 | Source of contacts, firmographic filters, saved searches, and the sequence sender controlling your secondary inboxes. Start Basic, move to Professional if you need more credits and advanced filters. |
| 2 | Enrichment / waterfall (optional, high-leverage) | **Clay** | Starter | 0–149 | Optional. Fills gaps Apollo misses (verified emails, signals, company context for personalization tokens). Skip at launch to save budget; add once volume justifies it. Free tier exists for testing. |
| 3 | Sending infrastructure (multi-inbox warmup + send) | **Smartlead** (or Instantly) | Basic / Starter | 39–94 | Runs warmup on every inbox, rotates sending across inboxes, manages bounce/reply handling, and protects deliverability. This is the engine that actually sends. Either tool works; Smartlead's per-inbox model scales cleanly. |
| 4 | Secondary sending domains x3–5 | Registrar (Cloudflare / Namecheap / Porkbun) | annual, amortized | 5–15 | 3 to 5 domains close to intelbase's brand (for example intelbase-os.com, getintelbase.com, tryintelbase.com). Annual registration ~US$10–12/domain/yr each, so ~US$5–15/mo amortized across all of them. Never send from your primary intelbase domain. |
| 5 | Inboxes x9–15 | Google Workspace (or a reseller) | per inbox | 45–90 | 3 inboxes per domain is the safe ceiling. With 3–5 domains that is 9–15 inboxes. ~US$6/inbox/mo at Workspace list price; cheaper via resellers. Each inbox sends a low daily volume (see DELIVERABILITY_SETUP.md). |
| 6 | Email verification | **MillionVerifier** (or NeverBounce) | pay-as-you-go / starter | 30–50 | Verify every address before it enters a sequence. Pay-as-you-go credits; MillionVerifier is cheap per-verification. Non-negotiable for protecting domain reputation. |
| 7 | Booking + CRM | **Cal.com** + Apollo CRM / HubSpot free | free tier | 0–50 | Cal.com free tier for the booking link. Apollo's built-in CRM (or HubSpot free) tracks leads and replies. No paid CRM needed at launch. See BOOKING_AND_CRM.md. |
| 8 | Multichannel (LinkedIn), optional / deferred | HeyReach or PhantomBuster | - | 0–99 | Deferred to v2 per REQUIREMENTS.md. Email loop is proven first. Listed so the budget shows headroom if you choose to add it later. |

## Totals

### Launch configuration (recommended start - email only, no Clay, no LinkedIn)

| Line | US$/mo |
|------|--------|
| Apollo (Basic) | 49 |
| Smartlead (Basic) | 39 |
| Domains x3 (amortized) | 9 |
| Inboxes x9 (Workspace ~$6 each) | 54 |
| MillionVerifier (pay-as-you-go) | 30 |
| Cal.com + Apollo CRM | 0 |
| **Launch total** | **~181 / mo** |

US$181/mo is about **1,415 HKD/mo** - roughly **14% of the 10k HKD ceiling**. Large headroom.

### Scaled configuration (more volume - Apollo Pro, Clay on, 5 domains, 15 inboxes)

| Line | US$/mo |
|------|--------|
| Apollo (Professional) | 99 |
| Clay (Starter) | 149 |
| Smartlead (higher tier) | 94 |
| Domains x5 (amortized) | 15 |
| Inboxes x15 (Workspace ~$6 each) | 90 |
| MillionVerifier (more credits) | 50 |
| Cal.com Pro + CRM | 50 |
| HeyReach (LinkedIn, optional) | 99 |
| **Scaled total** | **~646 / mo** |

US$646/mo is about **5,040 HKD/mo** - roughly **50% of the 10k HKD ceiling**. Still under, with room.

## Budget summary vs ceiling

| Configuration | US$/mo | HKD/mo (~7.8) | % of 10k HKD ceiling |
|---------------|--------|---------------|----------------------|
| Launch (email only) | ~181 | ~1,415 | ~14% |
| Scaled (full stack + LinkedIn) | ~646 | ~5,040 | ~50% |
| Ceiling | ~1,280 | 10,000 | 100% |

**Both configurations fit comfortably under 10,000 HKD/mo with headroom.** Start at Launch, scale to
Scaled only once the email loop is booking calls. The remaining headroom is intentional: it covers
price changes, extra Apollo credits, and the optional LinkedIn channel without breaching the ceiling.

## What costs money (all are hand-backs, not executed)

Every line above requires a purchase or a credential. None was bought, signed up for, or run. The
ordered "press go" purchase list is in `RUNBOOK.md` (the PRESS GO section), which feeds the
orchestrator's consolidated hand-back.
