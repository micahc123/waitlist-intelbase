# Runbook (LEAD-06)

> How to run the intelbase OS outbound system day to day once the tools are bought, plus the explicit
> **PRESS GO** list of everything the user must purchase, configure, and credential to switch it on.
> No em dashes. **Nothing requiring purchase, signup, or sending was auto-run.** This is build-to-go.

---

## PART A - PRESS GO (what the USER must do to switch it on)

Nothing in this list was executed. Every step needs your money, your account, or your credentials.
Do them in order. Costs are list-price estimates in USD; confirm at purchase. The HKD ceiling is
10,000/mo and the launch config sits near 1,415 HKD/mo (see STACK_AND_BUDGET.md).

### Step 1 - Register secondary domains (about 1 hour, ~US$30–60/yr total)
- Register 3 to 5 lookalike domains at a registrar (Cloudflare, Namecheap, or Porkbun).
  Suggested: `intelbase-os.com`, `getintelbase.com`, `tryintelbase.com` (+ 2 more if scaling).
- Set each to redirect to the primary intelbase site.
- **Do not** use the primary intelbase domain for cold sending.

### Step 2 - Buy mailbox inboxes (about 1–2 hours, ~US$45–90/mo)
- Create 3 inboxes per domain in Google Workspace (or a reseller). 9 inboxes at launch, up to 15 scaled.
- Fill each profile: real name, photo, title, signature.

### Step 3 - Configure DNS auth on every domain (about 1–2 hours, included in domain cost)
- Set SPF, DKIM, DMARC, and MX on each domain. Add a custom tracking domain.
- Verify all records (MXToolbox or the sending tool's checker). See DELIVERABILITY_SETUP.md section 2.

### Step 4 - Buy and configure the sending tool (about 1 hour, ~US$39–94/mo)
- Subscribe to Smartlead (or Instantly). Connect all inboxes.
- **Turn on warmup for every inbox now.** Warmup must run **at least 3 weeks** before any cold send.
- Import the sequences from `SEQUENCES/sequences.json` (or `.csv`). Set token fallbacks.

### Step 5 - Buy Apollo and build the searches (about 1–2 hours, ~US$49–99/mo)
- Subscribe to Apollo (Basic to start).
- Recreate Saved Searches A, B, C from ICP_AND_APOLLO_SEARCH.md.
- Set Email Status = Verified. Apply the exclusion lists.

### Step 6 - Buy email verification credits (about 30 min, ~US$30–50/mo)
- Subscribe to MillionVerifier (or NeverBounce), pay-as-you-go credits.
- This is the second verification pass before any list is imported to the sending tool.

### Step 7 - Set up booking and CRM (about 1 hour, US$0–50/mo)
- Create the Cal.com event "intelbase OS - 15 min intro call" (15 min, business hours, qualifying
  questions). See BOOKING_AND_CRM.md.
- Set its URL as the `{{booking_link}}` token in the sequences.
- Choose Apollo CRM or HubSpot free as the master lead store.
- **Point the website Book-a-call CTA and the Phase 3 agent booking action at the same Cal.com link.**
- Connect Cal.com bookings into the master CRM, and confirm the Phase 3 dashboard reads that store.

### Step 8 - (Optional, scaling) Add Clay and/or LinkedIn
- Add Clay (~US$149/mo) for enrichment once volume justifies it.
- Add HeyReach/PhantomBuster (~US$99/mo) for LinkedIn once the email loop is proven. Deferred per
  REQUIREMENTS.md.

### Press-go gate
Do not send a single cold email until: warmup has run 3+ weeks, DNS is verified on all domains, your
first list passed two-pass verification, and the pre-launch checklist in DELIVERABILITY_SETUP.md
section 7 is fully checked.

**Earliest first cold send: about 3 to 4 weeks after Step 1, almost all of it warmup.**

---

## PART B - Daily and weekly operating runbook (once live)

### Daily (about 15–30 min)
1. **Check replies** across all inboxes (the sending tool aggregates them).
2. **Classify each reply** (positive / objection / negative-unsubscribe) per BOOKING_AND_CRM.md.
3. **Send the booking link** to positive replies in a one-line response; move them to "Engaged."
4. **Suppress** every opt-out immediately and permanently.
5. **Confirm sends went out** within the daily per-inbox limit (max 30 new per inbox).

### Weekly (about 1 hour)
1. **Top up the contact pool:** export a fresh batch from Apollo Saved Searches A/B/C, run two-pass
   verification, import to the sending tool. Keep the funnel fed.
2. **Check deliverability health:** bounce rate (pause if over 3 percent), spam complaint rate, open
   and reply rates. If reputation dips, slow the ramp and let warmup recover.
3. **Review booked calls** in the dashboard. Track booked calls per week as the core metric.
4. **Light A/B:** if one sequence/subject underperforms after enough volume, adjust one variable
   (subject or opener), not everything at once.

### Monthly
1. **Re-verify** any list older than 30 days before re-use.
2. **Review budget** against the 10k HKD ceiling. Decide whether to scale (Apollo Pro, Clay, more
   inboxes, LinkedIn) based on booked-call volume.
3. **Rotate / rest** any inbox showing reputation strain; keep warmup always on.

### Metrics to watch (the loop)
- Booked calls per week (north star).
- Reply rate and positive-reply rate per sequence.
- Bounce rate (hard ceiling 3 percent) and spam complaint rate.
- Cost per booked call (ties to the ROI dashboard story you sell).

---

## PART C - Confirmation of safety

- **No tool was purchased.** Apollo, Clay, Smartlead, domains, inboxes, verification, Cal.com:
  none bought, none signed up for.
- **No email was sent.** No warmup started, no cold send, no list uploaded anywhere.
- **No credentials were used or stored.**
- **No git command was run** by this build. Files were written only into `lead-gen/`.
- Everything that costs money or needs a credential is in PART A as a hand-back for you to execute,
  and feeds the orchestrator's consolidated hand-back (HAND-01).
