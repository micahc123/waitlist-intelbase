# Deliverability Setup (LEAD-04)

> A followable runbook for the sending infrastructure. The whole point: land in the inbox, protect
> reputation, never get flagged as spam. Do this **before** sending a single cold email. No em dashes.
> Nothing here was purchased or configured; it is the plan to press go.

## 1. Domains and inboxes (how many, and why)

| Item | Quantity (launch) | Quantity (scaled) | Rule |
|------|-------------------|-------------------|------|
| Secondary sending domains | 3 | 5 | Never send cold volume from the primary intelbase domain. Use lookalike domains. |
| Inboxes per domain | 3 | 3 | 3 inboxes per domain is the safe ceiling. More per domain raises risk. |
| Total inboxes | 9 | 15 | Spread volume thin across many inboxes. |

**Domain choice:** register 3 to 5 domains close to the brand, for example `intelbase-os.com`,
`getintelbase.com`, `tryintelbase.com`, `intelbase.io`, `intelbaseos.com`. Keep them visually
trustworthy and brand-consistent. Each domain should redirect to the main intelbase site so it
resolves if a prospect checks.

## 2. DNS authentication (per domain, all three records required)

Configure these on **every** sending domain before any inbox sends. Missing any one of them sends
you to spam.

| Record | Purpose | What to set |
|--------|---------|-------------|
| **SPF** | Authorizes the sending servers | A TXT record listing the authorized senders, for example `v=spf1 include:_spf.google.com ~all` (Google Workspace). Add the sending tool's include if it requires one. |
| **DKIM** | Cryptographically signs mail | Enable DKIM in the mailbox provider (Google Workspace admin generates the key), then publish the provided TXT/CNAME record on the domain. |
| **DMARC** | Tells receivers how to handle auth failures | A TXT record at `_dmarc.yourdomain`, for example `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain; pct=100`. Start at `p=none` to monitor, tighten to `quarantine` later. |

Also set:
- **MX records** pointing to the mailbox provider (Google Workspace).
- **Custom tracking domain** in the sending tool (Smartlead) so link tracking does not use a shared
  blacklisted domain. Only used from step 4 onward (links).
- **rDNS / PTR**: handled by the mailbox provider for Workspace; no action for you.

Verify all records with a checker (MXToolbox or the sending tool's built-in DNS check) before warmup.

## 3. Warmup plan and duration

**Do not send cold email from a fresh inbox.** Warm every inbox first.

| Phase | Duration | What happens |
|-------|----------|--------------|
| Warmup start | Day 1 | Turn on automated warmup (Smartlead/Instantly built-in) on all inboxes. The tool sends and replies to a warmup network so each inbox builds a positive sending history. |
| Warmup ramp | Weeks 1–3 | Warmup volume increases gradually and automatically. Do not send any cold email during this window. |
| Warmup minimum | **3 weeks (21 days) minimum**, 4 weeks preferred | Inboxes are not "ready" before 3 weeks. Rushing this is the single most common cause of landing in spam. |
| Ongoing warmup | Forever | Keep warmup running at a low level even after you start cold sending. It maintains reputation. |

**Timeline reality:** from buying domains to first cold send is about **3 to 4 weeks**, almost all
of it warmup. Plan for it. This is why nothing is "instant" even after you press go.

## 4. Sending limits and ramp (after warmup completes)

Per inbox, per day. Conservative on purpose.

| Week (post-warmup) | New cold emails per inbox per day | Total across 9 inboxes | Total across 15 inboxes |
|--------------------|-----------------------------------|------------------------|-------------------------|
| Week 1 | 10 | 90 | 150 |
| Week 2 | 15 | 135 | 225 |
| Week 3 | 20 | 180 | 300 |
| Week 4+ (steady) | 25–30 (hard ceiling) | 225–270 | 375–450 |

Rules:
- **30 new cold emails per inbox per day is the hard ceiling.** Do not exceed it. Higher volume per
  inbox is what gets domains burned.
- Sends happen in **business hours of the prospect's timezone**, spread out (the tool randomizes
  intervals). No bulk blast at one moment.
- Follow-up steps (2 to 5) do not count against the new-contact daily limit the same way, but keep
  total daily send per inbox reasonable (under ~50 including follow-ups).
- Business days only. No weekend sends.

## 5. Verification workflow (every address, every time)

A bad address that bounces hurts reputation. Verify in two passes.

1. **Pass 1 (Apollo):** set Email Status = Verified in the saved search. This is Apollo's own check.
2. **Pass 2 (MillionVerifier or NeverBounce):** export the list, run it through the verifier before
   importing to the sending tool. Remove everything that is not "valid / deliverable."
3. **Catch-all handling:** treat "catch-all / accept-all" addresses as risky. Either drop them or
   send to them at a much lower volume, separated from your main pool.
4. **Re-verify** any list older than 30 days before re-use; emails decay.
5. **Bounce ceiling:** if a campaign's bounce rate exceeds **3 percent**, pause it, re-verify the
   list, and investigate before resuming. Bounces above this level signal a list or reputation
   problem.

## 6. Do-not-blast rules (the hard list)

These are non-negotiable. Breaking them burns domains and wastes the budget.

1. **Never** send cold volume from the primary intelbase domain. Secondary domains only.
2. **Never** skip warmup. 3 weeks minimum per inbox.
3. **Never** exceed 30 new cold emails per inbox per day.
4. **Never** send to an unverified address. Two-pass verification, always.
5. **Never** put a link in step 1 (the cold opener). Links start at step 4.
6. **Never** use images, attachments, or tracking pixels in the cold opener.
7. **Never** use spam-trigger language ("guarantee", "free", "act now", "100%", "risk-free").
8. **Always** include a plain-text unsubscribe / opt-out path and honor it immediately (required for
   compliance and reputation). Suppress opt-outs permanently.
9. **Always** stop a sequence the moment a prospect replies.
10. **Always** monitor deliverability weekly (spam rate, bounce rate, reply rate). If spam complaints
    rise, pause, slow down, and let warmup recover.
11. **Respect local law:** CAN-SPAM (US), CASL (Canada), GDPR/PECR (UK/EU), and HK PDPO. Outbound B2B
    cold email is permitted in most target markets with a valid opt-out and accurate sender details;
    confirm specifics per region before sending and keep an accurate physical address in the footer.

## 7. Pre-launch checklist (gate before first cold send)

- [ ] 3 to 5 secondary domains registered and redirecting to intelbase.
- [ ] SPF, DKIM, DMARC, MX configured and verified on every domain.
- [ ] Custom tracking domain configured in the sending tool.
- [ ] 9 to 15 inboxes created (3 per domain), profiles filled (name, photo, signature).
- [ ] Warmup running on all inboxes for at least 3 weeks.
- [ ] Sender profile and signature set per inbox.
- [ ] First contact list verified in two passes, catch-alls handled.
- [ ] Sequences imported, tokens tested with empty-value fallbacks.
- [ ] Daily sending limits set to Week 1 ramp values.
- [ ] Opt-out / unsubscribe footer in place.

Only when every box is checked do you start cold sending.
