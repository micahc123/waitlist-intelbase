# Requirements — intelbase Autonomous AI Operating System (v1 milestone)

Derived from PROJECT.md and `marketing/ai-os-pivot-research.md`. Each requirement is atomic and
testable. Traceability (phase mapping) is filled by the roadmapper.

## v1 Requirements

### Positioning & Brand (POS)
- [ ] **POS-01**: Site headline + sub-headline communicate "autonomous AI Operating System that runs your business's front office and growth" in plain language
- [ ] **POS-02**: SEO metadata (title, description, OG/Twitter) reflect the new AI OS positioning
- [ ] **POS-03**: A single named flagship offer is presented consistently across hero, services, and pricing (Revenue/Ops fused "AI OS")
- [ ] **POS-04**: Messaging includes a trust/guardrails angle (autonomous but safe — never hallucinates a price/promise)

### Website Rewrite (SITE)
- [ ] **SITE-01**: Hero rewritten to the AI OS offer with one primary CTA
- [ ] **SITE-02**: Services section rewritten to the AI OS capability set (chatbot, lead gen, nurture, ads, dashboard)
- [ ] **SITE-03**: Process section rewritten to how an autonomous AI OS gets deployed (e.g. map → build → go live autonomously)
- [ ] **SITE-04**: Proof section + testimonials/KPIs rewritten to the AI OS positioning (no fabricated hard numbers)
- [ ] **SITE-05**: Pricing rewritten to AI OS packaging (setup + monthly retainer; ranges per research)
- [ ] **SITE-06**: CTA, footer, quote-modal, and work page (past-projects + projects-data) rewritten to the new positioning
- [ ] **SITE-07**: Build passes (`next build` / typecheck) with no broken imports after the rewrite
- [ ] **SITE-08**: Prior positioning recoverable in git; a CHANGES entry documents the third pivot

### Demo AI-OS Agent (AGENT)
- [ ] **AGENT-01**: A website chatbot/agent answers visitor questions about the AI OS offer grounded in site content
- [ ] **AGENT-02**: The agent autonomously qualifies a visitor (captures intent, business type, need) without a human
- [ ] **AGENT-03**: The agent can book a call (surfaces/links a booking action) when a visitor is qualified
- [ ] **AGENT-04**: Guardrails: the agent refuses to invent prices/promises and hands off (escape hatch) below a confidence threshold
- [ ] **AGENT-05**: The agent is deployed live on intelbase's own site as the dogfood demo
- [ ] **AGENT-06**: Captured leads/conversations are persisted (so they feed the funnel/dashboard)

### Performance Dashboard (DASH)
- [ ] **DASH-01**: A dashboard shows the autonomous loop working (conversations, qualified leads, booked calls)
- [ ] **DASH-02**: Dashboard reads real captured data from the agent (not hardcoded), with an empty state

### Ads Update & Redeploy Prep (ADS)
- [ ] **ADS-01**: `~/Developer/adsmanager/copy/ad_copy.yaml` rewritten to the AI OS positioning
- [ ] **ADS-02**: Ad creatives (HTML) updated and re-rendered to PNGs via `render.mjs`
- [ ] **ADS-03**: `docs/CAMPAIGN_BLUEPRINT.md` updated to the new positioning + audience targeting
- [ ] **ADS-04**: An exact redeploy checklist (Meta MCP/credential steps) is produced for the user to execute

### Apollo Lead-Gen System (LEAD)
- [ ] **LEAD-01**: A documented outbound tooling stack fits ≤10k HKD/mo (Apollo + optional Clay + sending infra + verification + booking) with roles and rough costs
- [ ] **LEAD-02**: Ideal Customer Profile + Apollo search/filter definitions for intelbase's target buyer are specified
- [ ] **LEAD-03**: Cold outbound sequences/copy for the AI OS offer are written (multi-step, deliverability-safe)
- [ ] **LEAD-04**: Deliverability setup is specified (multiple domains × inboxes, warmup, verification) as config + steps
- [ ] **LEAD-05**: Booked-call path wired (booking link/CRM capture) so replies convert to calls
- [ ] **LEAD-06**: System built to "press go" — any code/config/templates committed; nothing requiring purchase is auto-run

### Spend & Deploy Hand-back (HAND)
- [ ] **HAND-01**: A single consolidated checklist lists every purchase, credential, domain/inbox, and deploy action the user must perform, with order and rough cost
- [ ] **HAND-02**: No tool is purchased, no ad spend pushed, and no live deploy executed autonomously

## v2 / Deferred
- Multi-channel outbound (LinkedIn/phone) beyond email — add after email loop proven
- Per-client white-labeled deployment of the AI OS — productize after the dogfood demo converts
- Enterprise governed-data / on-prem variant — out of small-agency reach this milestone

## Out of Scope
- Executing purchases, ad spend, or live deploys — user-executed via checklists (no account access; irreversible)
- Net-new design system / full redesign — reuse existing components + CSS
- Human-in-the-loop ops product — superseded by autonomous-first + guardrails decision

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| POS-01 | Phase 1 | Pending |
| POS-02 | Phase 1 | Pending |
| POS-03 | Phase 1 | Pending |
| POS-04 | Phase 1 | Pending |
| SITE-01 | Phase 2 | Pending |
| SITE-02 | Phase 2 | Pending |
| SITE-03 | Phase 2 | Pending |
| SITE-04 | Phase 2 | Pending |
| SITE-05 | Phase 2 | Pending |
| SITE-06 | Phase 2 | Pending |
| SITE-07 | Phase 2 | Pending |
| SITE-08 | Phase 2 | Pending |
| AGENT-01 | Phase 3 | Pending |
| AGENT-02 | Phase 3 | Pending |
| AGENT-03 | Phase 3 | Pending |
| AGENT-04 | Phase 3 | Pending |
| AGENT-05 | Phase 3 | Pending |
| AGENT-06 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| ADS-01 | Phase 4 | Pending |
| ADS-02 | Phase 4 | Pending |
| ADS-03 | Phase 4 | Pending |
| ADS-04 | Phase 4 | Pending |
| LEAD-01 | Phase 5 | Pending |
| LEAD-02 | Phase 5 | Pending |
| LEAD-03 | Phase 5 | Pending |
| LEAD-04 | Phase 5 | Pending |
| LEAD-05 | Phase 5 | Pending |
| LEAD-06 | Phase 5 | Pending |
| HAND-01 | Phase 5 | Pending |
| HAND-02 | Phase 5 | Pending |
