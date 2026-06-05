# intelbase OS - Outbound Lead-Gen System (Phase 5)

> A complete, autonomous Apollo-based outbound lead-gen system for intelbase, selling **intelbase OS**
> (the autonomous AI operating system that runs a business's front office and growth). Built to the
> "press go" point: documents, config, and templates only. **Nothing was purchased, sent, or
> git-committed.** Everything that costs money or needs credentials is a hand-back in the runbook.
>
> Budget ceiling: 10,000 HKD/mo (about US$1,280). Launch config lands near 1,415 HKD/mo (~14%).
> Goal: maximize booked client calls.

## Index

| File | Requirement | What it covers |
|------|-------------|----------------|
| [STACK_AND_BUDGET.md](./STACK_AND_BUDGET.md) | LEAD-01 | The concrete tool stack (Apollo + optional Clay + sending infra + domains + inboxes + verification + booking), each role, rough US$/mo, totals, and the HKD conversion vs the 10k ceiling. |
| [ICP_AND_APOLLO_SEARCH.md](./ICP_AND_APOLLO_SEARCH.md) | LEAD-02 | The Ideal Customer Profile (firmographics, titles, signals, geos incl. HK/APAC + English markets) and three concrete Apollo Saved Searches to recreate it. |
| [SEQUENCES/](./SEQUENCES/) | LEAD-03 | Two deliverability-safe cold email sequences (5 steps each) with subjects, bodies, timing, and personalization tokens. Provided as markdown plus `sequences.csv` and `sequences.json` for import. |
| [DELIVERABILITY_SETUP.md](./DELIVERABILITY_SETUP.md) | LEAD-04 | The deliverability runbook: domains/inboxes count, SPF/DKIM/DMARC, warmup plan and duration, sending limits and ramp, two-pass verification, and the do-not-blast rules. |
| [BOOKING_AND_CRM.md](./BOOKING_AND_CRM.md) | LEAD-05 | The booked-call path: Cal.com setup, how replies route to a call, CRM/lead capture, and how outbound joins the same funnel as the Phase 3 website agent and the site's Book-a-call CTA. |
| [RUNBOOK.md](./RUNBOOK.md) | LEAD-06 | Day-to-day operating runbook plus the explicit ordered **PRESS GO** list of what the user must buy, configure, and credential to switch it on. |

## How the pieces connect

```
ICP + Apollo searches (LEAD-02)
        |
        v
Verified contact list (LEAD-04: two-pass verification)
        |
        v
Warmed inboxes across multiple domains (LEAD-04: warmup + DNS auth)
        |
        v
Cold sequences (LEAD-03: 2 variants, deliverability-safe)
        |
        v
Reply or click -> Cal.com booking (LEAD-05)
        |
        v
One CRM + one dashboard, shared with the Phase 3 website agent (LEAD-05)

All of it sized to fit under 10k HKD/mo (LEAD-01) and built to press go (LEAD-06).
```

## Safety statement

No tool was purchased or signed up for. No email, warmup, or send was run. No credentials were used.
No git command was executed. All files live under `lead-gen/`. The PRESS GO section of
[RUNBOOK.md](./RUNBOOK.md) is the hand-back of everything you must do to switch the system on, and it
feeds the orchestrator's consolidated hand-back (HAND-01, HAND-02).
