# Roadmap: intelbase — Autonomous AI Operating System

## Overview

This milestone pivots intelbase (its third pivot) to a fully autonomous "AI Operating System"
offer and builds the proof that sells it. We first lock the positioning every other workstream
reuses, then rewrite the marketing site to that offer, then build and dogfood the core
differentiator — an autonomous chatbot agent (qualify → answer → book, with guardrails) living on
the site plus a performance dashboard. In parallel branches off the locked positioning, we update
the separate ads repo and build an Apollo-based autonomous outbound engine to the "press go" point.
Every purchase, credential, and live-deploy action is collected — never executed — into a single
consolidated hand-back checklist the user runs.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Positioning & Messaging Foundation** - Lock the named AI-OS offer, trust/guardrails angle, and SEO that the site, ads, and outbound all reuse ✓ 2026-06-05
- [x] **Phase 2: Website Rewrite** - Rewrite all site copy/structure to the AI-OS offer on the existing component system; build passes (build UNVERIFIED — node_modules absent; user runs `npm install && npm run build`) ✓ 2026-06-05
- [x] **Phase 3: Demo AI-OS Agent & Dashboard** - Ship the guardrailed autonomous chatbot (qualify/answer/book) live on the site as dogfood, plus a real-data performance dashboard ✓ 2026-06-05 (code to press-go; keys/storage/deploy + fork-route verification handed back)
- [x] **Phase 4: Ads Update & Redeploy Prep** - Re-copy/re-render ads in the separate adsmanager repo to the new positioning and produce a redeploy checklist ✓ 2026-06-05 (adsmanager has no git; changes on disk, Meta deploy handed back)
- [x] **Phase 5: Apollo Lead-Gen & Consolidated Hand-back** - Build autonomous outbound to "press go" on ≤10k HKD/mo and produce the single consolidated spend/deploy checklist ✓ 2026-06-05 (see HANDBACK.md)

## Phase Details

### Phase 1: Positioning & Messaging Foundation
**Goal**: A single named, consistent AI-OS offer definition (with a trust/guardrails angle and SEO metadata) exists as the source of truth that every downstream workstream reuses.
**Depends on**: Nothing (first phase)
**Requirements**: POS-01, POS-02, POS-03, POS-04
**Success Criteria** (what must be TRUE):
  1. A reader can state, in one plain-language sentence, what intelbase's autonomous AI Operating System does for a business's front office and growth (POS-01).
  2. One named flagship offer (Revenue/Ops fused "AI OS") is defined once and reused verbatim across hero, services, and pricing messaging — no competing names (POS-03).
  3. The messaging explicitly carries the "autonomous but safe — never hallucinates a price or promise" trust/guardrails angle (POS-04).
  4. SEO metadata (title, description, OG/Twitter) text is written for the new positioning, ready to drop into `layout.tsx` (POS-02).
**Plans**: TBD

### Phase 2: Website Rewrite
**Goal**: The marketing site (this repo) is fully rewritten to the locked AI-OS offer on the existing design system, with a clean build and the pivot documented and git-recoverable.
**Depends on**: Phase 1
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08
**Success Criteria** (what must be TRUE):
  1. A visitor on the homepage sees a hero, services, process, proof, and pricing all describing the AI-OS offer with one primary CTA, and no leftover lead-gen-pivot copy (SITE-01, SITE-02, SITE-03, SITE-04, SITE-05).
  2. CTA, footer, quote-modal, and the /work page (past-projects + projects-data) all reflect the new positioning (SITE-06).
  3. `next build` / typecheck passes with no broken imports after the rewrite (SITE-07).
  4. The prior positioning is recoverable in git and a CHANGES entry documents this third pivot (SITE-08).
**Plans**: TBD
**Notes**: Writes Next.js code on a modified/breaking fork — implementers MUST read `node_modules/next/dist/docs/` before writing Next.js code (per AGENTS.md). Reuse existing components/CSS; this is copy + data, not a redesign. Proof/KPIs use ranges, no fabricated hard numbers (SITE-04).
**UI hint**: yes

### Phase 3: Demo AI-OS Agent & Dashboard
**Goal**: A guardrailed autonomous chatbot that qualifies, answers, and books — deployed live on intelbase's own site as the dogfood demo — with a dashboard showing the real autonomous loop working. This is the core differentiator.
**Depends on**: Phase 2 (the agent and dashboard live on the rewritten site)
**Requirements**: AGENT-01, AGENT-02, AGENT-03, AGENT-04, AGENT-05, AGENT-06, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. A visitor can ask the on-site chatbot about the AI-OS offer and get answers grounded in site content (AGENT-01).
  2. Without any human, the agent qualifies the visitor (captures intent, business type, need) and surfaces a booking action when the visitor is qualified (AGENT-02, AGENT-03).
  3. Guardrails hold: the agent refuses to invent prices or promises and hands off via an escape hatch below a confidence threshold (AGENT-04).
  4. The agent runs live on intelbase's own site and persists each conversation/lead so it feeds the funnel (AGENT-05, AGENT-06).
  5. A dashboard displays conversations, qualified leads, and booked calls from the agent's real captured data (not hardcoded), with a sensible empty state (DASH-01, DASH-02).
**Plans**: TBD
**Notes**: Writes Next.js code on a modified/breaking fork — implementers MUST read `node_modules/next/dist/docs/` before writing Next.js code (per AGENTS.md). Guardrails (AGENT-04) are mandatory, not optional polish — research flags over-promising on customer-facing AI as the main failure mode. Any hosting keys, LLM API keys, or persistence/credential setup needed to deploy the agent live are NOT executed here — they are produced as hand-back items that feed the Phase 5 consolidated checklist.
**UI hint**: yes

### Phase 4: Ads Update & Redeploy Prep
**Goal**: The separate ads pipeline is re-copied and re-rendered to the new AI-OS positioning, with an exact redeploy checklist for the user to execute.
**Depends on**: Phase 1 (consumes the locked positioning/messaging)
**Requirements**: ADS-01, ADS-02, ADS-03, ADS-04
**Success Criteria** (what must be TRUE):
  1. `~/Developer/adsmanager/copy/ad_copy.yaml` is rewritten to the AI-OS positioning (ADS-01).
  2. Ad creatives (HTML) are updated and re-rendered to PNGs via `render.mjs` (ADS-02).
  3. `docs/CAMPAIGN_BLUEPRINT.md` is updated to the new positioning and audience targeting (ADS-03).
  4. An exact Meta MCP/credential redeploy checklist is produced for the user to run — no ad spend is pushed (ADS-04).
**Plans**: TBD
**Notes**: This phase touches a SEPARATE external repo at `~/Developer/adsmanager` — NOT this repo and NOT committed by GSD. The ADS-04 redeploy checklist is a spend/deploy hand-back item that also feeds the Phase 5 consolidated checklist (HAND-01).

### Phase 5: Apollo Lead-Gen & Consolidated Hand-back
**Goal**: An autonomous Apollo-based outbound engine built to the "press go" point on ≤10k HKD/mo of tooling, plus one consolidated checklist of every spend/credential/deploy action across all phases — nothing purchased or deployed autonomously.
**Depends on**: Phase 1 (positioning for outbound copy); consolidates spend/deploy steps from Phases 2–4
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, HAND-01, HAND-02
**Success Criteria** (what must be TRUE):
  1. A documented outbound stack (Apollo + optional Clay + sending infra + verification + booking) fits ≤10k HKD/mo with roles and rough costs (LEAD-01).
  2. The ICP, Apollo search/filter definitions, multi-step deliverability-safe cold sequences, and the deliverability setup (multi-domain × inbox, warmup, verification) are all specified as committed config/steps (LEAD-02, LEAD-03, LEAD-04).
  3. The booked-call path is wired (booking link / CRM capture) so replies convert to calls, and all code/config/templates are committed to the "press go" point with nothing requiring purchase auto-run (LEAD-05, LEAD-06).
  4. A single consolidated checklist lists every purchase, credential, domain/inbox, and deploy action across all workstreams (ads redeploy, Apollo tooling, agent hosting/API keys) with order and rough cost (HAND-01).
  5. The user can confirm nothing was purchased, no ad spend pushed, and no live deploy executed autonomously (HAND-02).
**Plans**: TBD
**Notes**: HAND-01 is the consolidation point — it must absorb the spend/deploy hand-back items surfaced by Phase 3 (agent hosting / LLM API / persistence keys) and Phase 4 (ADS-04 ad redeploy), not just Apollo tooling. Budget ceiling ~10,000 HKD/mo (~US$1,280); costs are list-price estimates to confirm at purchase.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5
(Phases 4 and 5 depend only on Phase 1, so they may run in parallel with Phases 2–3.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Positioning & Messaging Foundation | 1/1 | ✓ Complete | 2026-06-05 |
| 2. Website Rewrite | 1/1 | ✓ Complete (build unverified) | 2026-06-05 |
| 3. Demo AI-OS Agent & Dashboard | 1/1 | ✓ Complete (press-go; deploy handed back) | 2026-06-05 |
| 4. Ads Update & Redeploy Prep | 1/1 | ✓ Complete (on disk; Meta deploy handed back) | 2026-06-05 |
| 5. Apollo Lead-Gen & Consolidated Hand-back | 1/1 | ✓ Complete (press-go; see HANDBACK.md) | 2026-06-05 |
