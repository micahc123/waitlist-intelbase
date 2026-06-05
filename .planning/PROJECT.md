# intelbase — Autonomous AI Operating System

## What This Is

intelbase is a Hong Kong-based AI agency repositioning (its third pivot) to sell a **fully
autonomous AI Operating System** — software + setup that runs a business's entire front office and
growth engine end-to-end (website AI chatbot, lead generation, lead nurture, ads, and a reporting
dashboard) with little-to-no human in the loop. The agency builds the system, deploys it on the
client's stack, and the client owns it. We dogfood it: the same autonomous agent runs live on our
own site and our own Apollo outbound, which doubles as the sales demo.

## Core Value

A prospect can land on a business's site and be qualified, answered, and booked into a call by the
AI Operating System **autonomously** — no human touched it — and the business owner can see it
working on a dashboard. If that one loop works and is trustworthy, everything else follows.

## Requirements

### Validated

<!-- Existing capabilities inferred from the current Next.js codebase. -->

- ✓ Next.js marketing site with hero, services, process, proof, pricing, CTA, footer, work page — existing
- ✓ Quote-request modal with scope selection — existing
- ✓ Meta Pixel lead tracking + Stripe lib wired — existing
- ✓ Separate ad pipeline (`~/Developer/adsmanager`): copy.yaml → HTML creatives → render.mjs → Meta-ads MCP — existing
- ✓ Higgsfield-based ad creative capability — existing

### Active

<!-- Current milestone scope. Hypotheses until shipped. -->

- [ ] Reposition all site copy/structure to the autonomous AI Operating System offer (overwrite prior lead-gen pivot)
- [ ] Ship a website AI chatbot/agent that autonomously qualifies leads, answers questions, and books calls (with guardrails)
- [ ] Deploy that agent live on intelbase's own site as the dogfood demo
- [ ] Build a performance/ROI dashboard showing the autonomous loop working
- [ ] Update ad copy + creatives in `~/Developer/adsmanager` to the new positioning, re-render, and prep a redeploy checklist
- [ ] Build an Apollo-based autonomous outbound lead-gen system to the "press go" point on ~10k HKD/mo of tooling
- [ ] Produce exact buy/credential/deploy checklists for every spend step (nothing purchased or deployed autonomously)

### Out of Scope

- Actually purchasing tools, paying for ad spend, or pushing live deploys — **handed back to the user as checklists** (no access to their accounts/spend; outward-facing + irreversible)
- Full human-in-the-loop ops product — superseded by the autonomous-first decision; guardrails replace humans
- On-prem / enterprise governed-data "AI OS" (PwC/Palantir-tier) — out of reach for a small agency this milestone
- Net-new design system — reuse the existing component/CSS system; this is a copy + capability pivot, not a redesign

## Context

- **Third pivot.** `CHANGES.md` records the prior pivot (May 30) from generalist AI automation →
  AI ad/social automation + lead gen (Higgsfield). This milestone overwrites that positioning; the
  old version stays recoverable in git.
- **Research done.** `marketing/ai-os-pivot-research.md` holds verified market research (deep-research
  run `wf_0d1dfe85-7f1`, 22 confirmed claims), pricing norms, the Apollo stack, and the locked offer.
- **Two repos.** Website = this repo. Ads = separate repo at `~/Developer/adsmanager` (not committed by GSD).
- **Key market facts:** category is real but crowded (PwC, Dell+Palantir at the top; every holdco
  claims an "OS") → demo-first proof is the moat. 63% of SMBs call AI their most impactful tech but
  only ~31% are operational with it. Buyers want bounded, ROI-visible systems; over-promising on
  autonomous customer-facing AI is the main failure mode → guardrails required.

## Constraints

- **Tech stack**: Next.js (a modified/breaking fork — per AGENTS.md, read `node_modules/next/dist/docs/` before writing Next.js code), React, TypeScript, Tailwind/CSS, framer-motion, Meta Pixel, Stripe.
- **Budget**: Outbound tooling ≤ ~10,000 HKD/month (~US$1,280). Build to "press go"; user executes purchases.
- **Spend/deploy**: All purchases, credentials, ad redeploys, and live deploys are user-executed via handed-back checklists — never autonomous.
- **Trust**: Autonomous customer-facing AI must have guardrails (confidence thresholds + human-escape hatch) so it never hallucinates a price or promise.
- **Reuse**: Keep the existing design system and component structure; pivot is copy + new capability, not a redesign.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Third pivot to "autonomous AI Operating System" | User direction; category demand is real (63% SMB interest) | — Pending |
| Autonomous-first WITH guardrails (not human-in-loop) | User wants minimal human touch; research flags over-promise risk on customer-facing AI | — Pending |
| Demo = dogfood (agent live on own site + own Apollo outbound) | One build serves pitch, demo, and our own pipeline | — Pending |
| Lead with Revenue+Ops fused "AI OS"; build to "press go" on spend | Fastest to value; respects that spend/deploy need user's accounts | — Pending |
| Reuse existing component/CSS system | Pivot is copy + capability, not a redesign | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-05 after initialization*
