# 02 - Reactivation (GROW-02)

> Reactivate intelbase's OWN past leads and contacts from prior positioning (before the intelbase OS
> pivot). A respectful "we do something genuinely new now" multi-step email and WhatsApp sequence,
> with list hygiene and consent notes, routing booked calls into the same funnel. This is intelbase
> dogfooding the **Reactivation Engine** module (POS expansion modules). No em dashes. Nothing here
> was sent; it is build-to-press-go.

## 1. Why this exists

intelbase already has a list: people who enquired before the pivot, old demo no-shows, past clients,
warm contacts from the prior offer. They are not cold strangers. The pivot to intelbase OS gives a
legitimate, non-spammy reason to reach out again: **the offer changed.** "We do something new now"
is true, specific, and respectful, which is exactly the angle that reactivation is allowed to use.

This pulls revenue out of a list intelbase already owns, at zero data cost, which is why it runs
first alongside the paid systems.

## 2. List sourcing and segmentation

Pull every past contact intelbase has the right to email or message into one sheet, then segment.

| Segment | Who | Angle |
|---------|-----|-------|
| **S1 - Past enquiries / unclosed leads** | People who enquired about the old offer but never signed | "The thing you looked at is now a full autonomous OS. Worth a fresh look." |
| **S2 - Demo no-shows / went quiet** | Booked or half-engaged then dropped | "Timing was off last time. The product is different now and the call is shorter." |
| **S3 - Past / current clients** | People who paid before | "You already trust us. Here is the new system. Want it on your business, or a referral arrangement?" (also feeds `06-partner-referral.md`) |
| **S4 - Warm network / personal contacts** | Founders, peers, prior intros | Lightest touch, personal, no template feel. Often a one-line manual note, not the sequence. |

**Consent gate before anyone enters a sequence (section 5):** only contacts who gave their details
to intelbase directly and have not opted out belong here. This is **first-party reactivation of
existing relationships**, not cold outbound, which is what makes it defensible under HK PDPO,
GDPR/PECR, and CASL. Do not import scraped or third-party lists into this system; that is what the
Apollo cold engine is for, under its own deliverability rules (`../DELIVERABILITY_SETUP.md`).

## 3. Channel choice

- **Email** for S1, S2, and most of S3. Use a real intelbase mailbox (a person's address), **not**
  the cold secondary domains. These are warm first-party contacts; they should hear from the real
  brand, and the warm domain reputation is fine for first-party mail.
- **WhatsApp** for S3 and S4 where you already have a number and a prior conversation (HK/Asia norm).
  WhatsApp reactivation must respect the opt-in and template rules in `05-whatsapp-broadcast.md`. If
  there is no prior WhatsApp thread, do not cold-WhatsApp; use email.
- **Personal note** for S4 high-value contacts. Skip the template entirely.

## 4. The reactivation sequence (full copy)

3 steps, spread over ~10 days, business days only. Stops on any reply. The "we changed" reason is the
spine; do not hide it. Tokens: `{{first_name}}`, `{{company}}`, `{{booking_link}}`, `{{sender_name}}`.

### Email version

**Step 1 - Day 0 - "we do something new now"**

Subject: we changed what intelbase does, {{first_name}}

Hi {{first_name}},

It has been a while. I wanted to reach out directly because intelbase is doing something different
now, and you are someone who looked at us before.

We used to do {brief one-line of the old offer}. We rebuilt the whole thing into intelbase OS: an AI
system that runs a business's front office and growth on its own. It answers every website visitor,
qualifies leads, books calls, follows up, and runs ads, with a guardrail so it never invents a price
or a promise.

The honest proof: the same system runs on our own site and our own outbound. The chat on intelbase
is the product.

If that is more relevant to {{company}} than what we talked about before, I would love to show you.
No pressure either way.

{{sender_name}}

---

**Step 2 - Day 4 - what it would actually run for them**

Subject: re: we changed what intelbase does

Hi {{first_name}},

Quick follow-up with something concrete. For a business like {{company}}, intelbase OS would:

- answer every visitor on your site in seconds and book the ones worth booking,
- run outbound to find more buyers without you hiring for it,
- follow up with every lead across channels until they book or opt out,
- and show the whole loop on one dashboard.

All of it autonomous, with a human-handoff the moment it is unsure.

If you want, I will walk you through the live version in 15 minutes: {{booking_link}}

{{sender_name}}

---

**Step 3 - Day 10 - soft close**

Subject: leaving this here

Hi {{first_name}},

I will not keep emailing. If the new intelbase OS is useful for {{company}}, the door is open and the
call is short: {{booking_link}}

And if you know someone it would suit better than you, I would genuinely appreciate the intro. We have
a referral arrangement for that.

Either way, good to be back in touch, {{first_name}}.

{{sender_name}}

If you would rather not hear from me, just reply "stop" and I will take you off entirely.

### WhatsApp version (S3 / S4, where a prior thread exists)

Keep it shorter, no subject lines, one message per step, more personal.

**Step 1 - Day 0**

Hi {{first_name}}, it is {{sender_name}} from intelbase. Been a while. We rebuilt intelbase into an AI
system that runs a business's front office and growth on its own (answers visitors, books calls, runs
follow-up and ads, with guardrails). The chat on our site is the actual product. Thought of you and
{{company}}. Open to a quick look? No pressure.

**Step 2 - Day 4**

Following up with the concrete bit: for {{company}} it would answer every visitor, book the good ones,
and run outbound and follow-up without you hiring for it. Want a 15 min walkthrough of the live one?
{{booking_link}}

**Step 3 - Day 10**

Last note from me on this. If it is useful, grab a slot here {{booking_link}}. And if you know someone
it suits better, we have a referral deal. Either way good to reconnect. Reply STOP anytime to opt out.

## 5. List hygiene and consent notes

- **First-party only.** Every contact must have given intelbase their details directly. No scraped,
  bought, or third-party lists in this system.
- **Honor the original consent and any opt-out history.** If someone previously unsubscribed, do
  **not** re-add them. Suppress permanently.
- **Email hygiene:** run the list through MillionVerifier (the existing verifier in
  `../STACK_AND_BUDGET.md`) before the first send. Old lists decay; bounces on a warm domain still
  hurt reputation. Drop invalid and risky addresses.
- **Every email carries a one-line opt-out** ("reply stop") and is honored immediately. Keep an
  accurate sender identity and physical address in the footer (CAN-SPAM, CASL, PECR).
- **WhatsApp:** only message contacts with a prior conversation or explicit opt-in. Provide STOP.
  Respect the 24-hour session window and template rules (`05-whatsapp-broadcast.md`).
- **HK PDPO:** reactivating your own customers for a directly related purpose is generally
  defensible; still give a clear opt-out and use the data only for the purpose it was collected for.
  Confirm specifics if a contact's original consent was narrow.
- **Frequency cap:** this is a one-time 3-step reactivation, not an ongoing list. Do not re-run the
  same contacts for at least 90 days. Move repliers out; move opt-outs to permanent suppression.

## 6. Routing booked calls into the same funnel

Reactivation does not get its own calendar or CRM. It joins the one funnel.

- Use the **same Cal.com event/link** (`{{booking_link}}`) as cold outbound, the website CTA, and the
  concierge (see `../BOOKING_AND_CRM.md`). Add a UTM or a distinct booking field value so reactivation
  calls are countable separately while still landing in the one dashboard, for example
  `?utm_source=reactivation&utm_campaign=we_changed`.
- Tag every reactivation contact in the master CRM with `source = reactivation` and its segment (S1–
  S4), so booked calls from this system show up alongside outbound and site-agent calls under one
  "booked calls this week" number.
- Positive replies route exactly like outbound: stop the sequence, send the booking link in one line,
  move to "Engaged." Opt-outs go to permanent suppression. Referral offers (S3/S4) route to
  `06-partner-referral.md`.

## 7. PRESS GO steps

Nothing below was executed.

1. **Export the past-contact list** from wherever it lives (old CRM, inbox, spreadsheet, WhatsApp).
2. **Segment** into S1–S4 (section 2). Tag each row.
3. **Strip opt-outs and prior unsubscribes.** Verify emails through MillionVerifier. Drop invalids.
4. **Set up the sequence** in your warm mailbox tool. For email, a simple tool or even the existing
   Smartlead account on a warm (non-cold) sending profile works; for low volume, manual send from a
   real mailbox is fine and feels more personal.
5. **For WhatsApp segments,** confirm prior opt-in / thread and follow `05-whatsapp-broadcast.md`
   template rules before any send.
6. **Set the Cal.com link** with the reactivation UTM as `{{booking_link}}`.
7. **Send Step 1 to a small test batch first** (5 to 10 contacts), check rendering and opt-out path,
   then roll out in small daily batches to protect the warm domain.
8. **Work replies daily** per `../BOOKING_AND_CRM.md`. Route referrals to `06-partner-referral.md`.

**Press-go gate:** do not send until the list is de-duped against opt-outs and verified, and the
opt-out path is tested. Sending warm reactivation to a stale, unverified list will hurt the main
domain reputation.

## 8. Safety

No email or WhatsApp message was sent. No list was uploaded or verified. No contact was added to any
tool. No git command was run. Everything is a hand-back.
