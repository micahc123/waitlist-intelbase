# 04 - LinkedIn Outbound (GROW-04)

> Multi-account LinkedIn outbound fed by the existing Apollo ICP (`../ICP_AND_APOLLO_SEARCH.md`).
> Tool options and costs within budget, connection and message sequences with full copy (two segment
> variants), daily limits and account-safety rules, and press-go steps. It runs **alongside** the
> cold-email engine on the **same ICP**, as a second channel into the same buyer. No em dashes.
> Nothing here was purchased or sent; it is build-to-press-go.

## 1. Why this exists and how it relates to the email engine

The cold-email engine (`../SEQUENCES/`) already targets the Apollo ICP. LinkedIn is the second
channel into the **same people**: founders, heads of growth, and ops leads who read LinkedIn but may
not open a cold email. Running both on the same ICP is multichannel done right: the buyer sees a
relevant email and a relevant connection request, which lifts reply rate without adding new targeting
work. This was deferred to v2 in the email plan; this is that v2 channel, specified to press-go.

**One ICP, one CRM, one calendar.** LinkedIn does not get its own targeting or its own booking flow.
It pulls the same Apollo Saved Searches A/B/C and books onto the same Cal.com event
(`../BOOKING_AND_CRM.md`).

## 2. Tool options and costs

Multi-account LinkedIn outbound = a tool that runs sequences across several LinkedIn accounts safely
(human-like sending, limits, warmup, unified inbox), fed by your Apollo lists. Costs are list-price
USD estimates; confirm at purchase. Keep total tooling within the ~10k HKD/mo ceiling across systems.

| Tool | What it is | Rough cost | Notes |
|------|-----------|------------|-------|
| **HeyReach** | Purpose-built for **multi-account / agency** LinkedIn outbound, unified inbox, native multi-sender | ~US$79–full agency tiers/mo | Best fit for running several accounts under one roof. Already named as the LinkedIn option in `../STACK_AND_BUDGET.md`. **Recommended.** |
| **Expandi** | Cloud-based, per-account, strong safety/limits | ~US$99/mo per account | Solid and safe; cost scales per account, so multi-account gets pricey. |
| **Dripify / Waalaxy** | Cheaper per-account LinkedIn automation | ~US$39–99/mo | Fine for one or two accounts; less suited to true multi-account at scale. |
| LinkedIn accounts | The sending accounts themselves | Sales Navigator ~US$99/mo each (optional but recommended for search/limits) | Use real, established accounts (yours + team). Aged accounts are safer than brand-new ones. |

**Recommended start:** **HeyReach** with **1 to 2 real LinkedIn accounts** (yours plus one team
member), optionally on Sales Navigator. A realistic launch cost is **~US$79–180/mo** (HeyReach + one
Sales Nav seat), which sits inside the ceiling alongside the email stack. Add accounts only once it
books calls and the accounts are healthy.

**Do not** buy fake/aged accounts from sketchy sellers or run more accounts than you have real people
for. Burned LinkedIn accounts are hard to recover and can take real identities down with them.

## 3. Feeding it from the Apollo ICP

- Export contacts from **Apollo Saved Searches A, B, C** (`../ICP_AND_APOLLO_SEARCH.md`). These hold
  the LinkedIn profile URLs.
- Route by search to the matching message variant:
  - **Search A (agencies / B2B services, HK + APAC)** and **Search C (ops-heavy + hiring signal)**
    -> **Variant 1 (Agencies / services)** below.
  - **Search B (B2B SaaS founders / growth leads)** -> **Variant 2 (SaaS / growth)** below.
- **De-dupe against the email engine:** it is fine (and good) for the same person to get both an email
  and a LinkedIn touch, but coordinate timing so they do not land the same hour, and **never** send
  two LinkedIn requests to the same person from two accounts. Tag each contact with which channel(s)
  touched them in the master CRM.
- Apply the same **exclusions** as the email engine (competitors, 200+ headcount, anti-ICP, existing
  customers, open won/lost). Do not connect with people already in an active email reply thread.

## 4. Connection + message sequences (full copy)

LinkedIn rules of the road baked into the copy: keep the connection note short and value-led (or send
a blank request, which often connects better), never pitch in the first message, escalate gently, one
clear ask, drop the booking link only after a reply or two. Stops the moment they reply. Tokens:
`{{first_name}}`, `{{company}}`, `{{booking_link}}`.

### Variant 1 - Agencies and B2B services (Searches A and C)

**Step 1 - Day 0 - Connection request (note, under 300 chars)**

Hi {{first_name}}, I work with agencies and B2B teams on running the front office on AI (answering
site visitors, booking calls, follow-up). Came across {{company}} and thought it was worth connecting.
No pitch.

*(Alternative: send the request with no note. Blank requests frequently accept at a higher rate.
A/B test note vs no-note.)*

**Step 2 - Day 1 after accept - Thanks + soft value (no link)**

Thanks for connecting, {{first_name}}. Quick context on what I do: we built intelbase OS, an AI system
that answers every website visitor, qualifies leads, and books calls on its own, with a guardrail so
it never invents a price or a promise. The honest proof is it runs on our own site and outbound, so
the chat that answers you is the product. Curious whether front-office work is mostly manual at
{{company}} right now?

**Step 3 - Day 4 - Concrete + light ask**

For a team like {{company}}, it would mean every visitor answered in seconds, leads qualified without
you, and a calendar that fills while you do the work you sell. Plus outbound running in the background.
Would a quick fifteen-minute look at the live dashboard be useful? Happy to send a link.

**Step 4 - Day 8 - Booking link**

No worries if the timing is off, {{first_name}}. If it is useful, here is my calendar for a short call,
no deck, you will know in five minutes if it fits: {{booking_link}}

**Step 5 - Day 13 - Soft close**

I will leave it here so I am not cluttering your inbox. If a front office that answers, qualifies, and
books on its own becomes relevant for {{company}}, the door is open: {{booking_link}}. Good to be
connected either way.

### Variant 2 - SaaS founders and growth leads (Search B)

**Step 1 - Day 0 - Connection request (note)**

Hi {{first_name}}, I help SaaS founders and growth leads get pipeline without building a sales and
marketing team, using one AI system. {{company}} looked like a fit to connect with. No pitch.

*(Or blank request, A/B test.)*

**Step 2 - Day 1 after accept - Thanks + soft value (no link)**

Thanks for connecting {{first_name}}. Short version of what I do: intelbase OS runs outbound, answers
and qualifies inbound, books the calls, and shows the whole loop on one dashboard, autonomously, with
guardrails. It runs on our own pipeline first, so it is not a deck, it is the thing working. Is
pipeline at {{company}} mostly founder-led right now, or do you have a growth function?

**Step 3 - Day 4 - Concrete + light ask**

The reason I ask: the teams that get the most out of it are the ones doing pipeline manually or
founder-led. intelbase OS gives you outbound, inbound qualification, nurture, and a ROI dashboard
without the headcount. Worth a quick fifteen minutes to see the live version?

**Step 4 - Day 8 - Booking link**

If it is useful, grab whatever slot works, {{first_name}}: {{booking_link}}. I will show you the live
dashboard and the guardrails, and you will know fast if it is a fit.

**Step 5 - Day 13 - Soft close**

Last note so I am not nagging. If autonomous pipeline becomes relevant for {{company}}, here is the
link whenever: {{booking_link}}. Either way, glad to be connected.

## 5. Daily limits and account safety (the hard rules)

LinkedIn bans accounts that behave like bots. These limits keep accounts alive.

| Action | Per account, per day | Rule |
|--------|----------------------|------|
| Connection requests | **15–25** (newer accounts lower; ramp up) | Start at ~10–15, ramp slowly over 2 to 3 weeks. Never spike. |
| Messages (to connections) | **30–50** | Spread through the day, business hours, human-like gaps. |
| Profile views | keep reasonable | The tool can warm with profile views; do not max it. |
| Total daily actions | keep well under platform thresholds | Let the tool randomize timing and add delays. |

Safety rules:
1. **Use real, established accounts.** Warm new accounts for 2 to 3 weeks (profile complete, some
   normal activity) before automating. Never automate a day-old account.
2. **One tool per account.** Never run two automation tools on the same LinkedIn account.
3. **Dedicated residential-style IP / sticky session per account** (HeyReach/Expandi handle this).
   Do not share one IP across many accounts.
4. **Ramp slowly.** Low limits week 1, increase gradually only if the account stays healthy.
5. **Watch for warnings.** If LinkedIn flags or restricts an account, pause it immediately, stop all
   automation on it, and let it rest. Do not push through a warning.
6. **Personalize and keep it human.** No spammy mass blasting, no link in the connection note, no
   pitch in the first message.
7. **Respect opt-outs.** If someone says stop or not interested, stop and suppress them across all
   channels (shared suppression list with email and voice).
8. **Do not exceed what real people could plausibly do.** The whole point is human-like behavior.

## 6. Routing booked calls into the same funnel

- Same **Cal.com event/link** as email, voice, and the site (`../BOOKING_AND_CRM.md`). Add a UTM,
  for example `?utm_source=linkedin&utm_campaign=variant1`, so LinkedIn-sourced calls are countable
  separately while landing in the one dashboard.
- Tag `source = linkedin` (and the variant) in the master CRM.
- Replies route like email: positive -> stop sequence, send booking link, mark "Engaged"; negative ->
  stop and suppress everywhere.
- Coordinate with email: if a contact books via LinkedIn, stop their email sequence too (and vice
  versa). One person, one funnel, no double-touch after they engage.

## 7. PRESS GO steps

Nothing below was executed.

1. **Choose the tool** (HeyReach recommended for multi-account). Create the account.
2. **Connect 1 to 2 real, established LinkedIn accounts.** Complete/clean the profiles. Optionally add
   Sales Navigator.
3. **Warm new or low-activity accounts for 2 to 3 weeks** before automating (normal manual use).
4. **Import the Apollo lists** (Saved Searches A/B/C exports with LinkedIn URLs). De-dupe against the
   email engine and apply exclusions (section 3).
5. **Build the two campaigns** (Variant 1 and Variant 2) with the copy in section 4. Set the Cal.com
   link with UTMs as the booking link in steps 4/5.
6. **Set conservative daily limits** (section 5, week-1 values) and let the tool randomize timing.
7. **Wire suppression and CRM tagging** so opt-outs and bookings sync with the shared funnel.
8. **Start with one account, small volume.** Watch account health for a week. Scale accounts and
   limits only if accounts stay healthy and it is booking calls.

**Press-go gate:** do not run automation on any account that is brand new or unwarmed, and do not
scale volume past the week-1 limits until accounts have stayed healthy for at least a week. A banned
account is the failure mode to avoid.

## 8. Safety

No tool was purchased, no LinkedIn account connected or automated, no connection request or message
sent, no list imported. No credentials used. No git command was run. Everything is a hand-back.
