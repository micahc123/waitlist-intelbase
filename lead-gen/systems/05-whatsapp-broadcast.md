# 05 - WhatsApp Broadcast and Opt-in (GROW-05, strategy side)

> WhatsApp broadcast and opt-in campaigns for HK and Asia, where WhatsApp is the default business
> channel. This is the **strategy and config** side. The inbound WhatsApp concierge webhook is being
> built in the codebase separately; this document references it and does not touch it. Opt-in
> mechanics, WhatsApp Business / Cloud API and template-approval notes, broadcast sequence copy,
> compliance, and press-go steps. No em dashes. Nothing here was purchased or sent; build-to-press-go.

## 1. Why this exists

In HK and much of Asia, WhatsApp is where business conversations actually happen. Email gets ignored;
a WhatsApp message gets read. This system uses WhatsApp two ways:
1. **Inbound concierge** (built in code separately): visitors message intelbase on WhatsApp, the AI
   concierge answers and books, the same way the website concierge does. This doc references that
   webhook; it does not build or edit it.
2. **Outbound broadcast and nurture** (this doc, strategy side): with proper opt-in, send template
   messages to a list (event follow-ups, reactivation responders, warm leads) that route to a booked
   call.

The hard truth about WhatsApp: **it is permission-first.** You cannot blast cold numbers. You can only
message people who opted in, and business-initiated messages must use **pre-approved templates**. This
doc is mostly about doing that correctly.

## 2. Relationship to the inbound concierge webhook (do not edit)

The codebase team is building the inbound WhatsApp concierge webhook (the endpoint that receives
WhatsApp messages and lets the AI concierge reply, qualify, and book). This system:

- **Feeds it:** opt-in CTAs (section 3) drive people to start a WhatsApp conversation, which the
  inbound webhook then handles with the AI concierge.
- **Shares its booking flow:** the concierge books onto the same Cal.com event as everything else
  (`../BOOKING_AND_CRM.md`).
- **Does not touch the webhook code.** Anything technical here (template registration, opt-in storage,
  broadcast sending) is configured in the WhatsApp Business Platform and the sending tool, and is a
  hand-back. Where this system needs the webhook (for example to handle replies to a broadcast), that
  is a coordination note to the src team, not a code change made here.

## 3. Opt-in mechanics (the gate)

You may only outbound-message people who opted in. Build clear opt-in points:

- **Website CTA:** a "Chat on WhatsApp" button (the `Contact` / `whatsapp_cta` event already exists in
  `src/lib/meta-pixel.ts`). Starting that chat is an opt-in to the conversation; capture an explicit
  opt-in to ongoing messages within the first reply.
- **Click-to-WhatsApp ads:** Meta ads with a WhatsApp destination. The click starts a conversation =
  opt-in. Pairs naturally with the retargeting system (`01-visitor-retargeting.md`).
- **Reactivation / event capture:** when collecting a number (event, form, reactivation responder),
  include a clear checkbox/line: "Tick to get updates and your booking link on WhatsApp." Store the
  consent with a timestamp and source.
- **First-message confirmation:** the inbound concierge confirms opt-in in its first reply and offers
  STOP, so consent is explicit and logged.

**Store for every contact:** number, opt-in source, opt-in timestamp, and opt-out status. Never
message a number without a recorded opt-in. Honor STOP instantly and permanently.

## 4. WhatsApp Business Platform and template approval notes

- **Use the official WhatsApp Business Platform (Cloud API)** via Meta, or a Business Solution Provider
  (BSP) on top of it (Twilio, 360dialog, MessageBird, Wati, or similar). The Cloud API is the
  compliant path; do not use unofficial/personal-account automation, which gets numbers banned.
- **Business-initiated messages need approved templates.** To message someone outside the 24-hour
  customer-service window, you send a **template message** that Meta has pre-approved. Templates have
  categories (Marketing, Utility, Authentication); marketing broadcasts use the **Marketing** category
  and are subject to per-user limits and quality scoring.
- **The 24-hour window:** once a user messages you, you have a 24-hour window to reply with free-form
  messages (this is where the inbound concierge operates). Outside it, you must use a template to
  reopen. Design broadcasts as templates; design replies inside the window as free-form (concierge).
- **Template approval:** submit each template for review (usually quick). Avoid promotional spam
  language and respect formatting rules. Keep a small set of approved templates rather than many.
- **Quality rating and limits:** Meta scores your number's quality from user feedback (blocks, reports)
  and tiers your daily messaging limit accordingly. High block/report rates throttle or ban you. This
  is why opt-in quality matters more than list size.
- **Cost:** Cloud API pricing is **per-conversation** (varies by country and category; marketing
  conversations cost more than utility), plus any BSP platform fee (~US$0–100+/mo depending on
  provider). For HK/Asia low volume, this is small; confirm current per-conversation rates for your
  target countries at setup. Keep total tooling within the ~10k HKD/mo ceiling across systems.

## 5. Broadcast sequence copy (template messages)

Templates must be pre-approved and use placeholders ({{1}}, {{2}}, ...) for variables. Below is the
intent and copy; register the final wording as templates. Keep them useful, not spammy, to protect
quality rating. Provide STOP every time.

### Template A - Opt-in welcome / value (Utility or Marketing)

Hi {{1}}, thanks for connecting with intelbase on WhatsApp. We run an AI system that answers your
website visitors, qualifies leads, and books your calls on its own, with guardrails so it never
invents a price. The chat you are in is the product. Want a quick look at the live version for your
business? Reply YES and I will set it up. Reply STOP to opt out anytime.

### Template B - Event / lead follow-up (Marketing)

Hi {{1}}, following up from {{2}}. The short version of intelbase OS: it runs your front office and
growth on AI, answering visitors, booking calls, and running follow-up, autonomously and with
guardrails. Worth a 15-minute look at the live dashboard? Here is the calendar: {{3}}. Reply STOP to
opt out.

### Template C - Reactivation responder hand-off (Marketing)

Hi {{1}}, glad you are interested in the new intelbase OS. Easiest next step is a short call where you
see it running live. Grab a slot here: {{2}}. Or reply with a question and a human will jump in. Reply
STOP to opt out.

### Inside-window free-form (concierge, not a template)

Once someone replies, the inbound concierge handles the conversation free-form inside the 24-hour
window: it answers questions, qualifies, and books, with the same guardrails as the website concierge
(never invents a price, hands off when unsure). That is the webhook the src team is building. Replies
to broadcasts therefore route straight into the concierge.

## 6. Compliance

- **Opt-in only.** No cold WhatsApp. Every contact has a recorded opt-in (section 3).
- **STOP honored instantly and permanently.** Maintain a suppression list shared with the other
  channels.
- **Templates for business-initiated messages.** Free-form only inside the 24-hour window.
- **HK PDPO:** use numbers only for the purpose consented to; keep consent records; provide opt-out.
- **HK UEMO (Unsolicited Electronic Messages Ordinance):** governs commercial electronic messages;
  honor unsubscribe and registry rules. WhatsApp's own opt-in/template rules are stricter than the
  legal floor anyway, so following WhatsApp's rules keeps you compliant in practice. Confirm current
  specifics before broadcasting.
- **Protect the quality rating:** low frequency, high relevance, easy opt-out. One bad blast can
  throttle the number.

## 7. Routing booked calls into the same funnel

- Same **Cal.com event/link** as every channel (`../BOOKING_AND_CRM.md`), passed as the `{{3}}`/`{{2}}`
  template variable, with a UTM, for example `?utm_source=whatsapp&utm_campaign=broadcast_b`.
- Tag `source = whatsapp` in the master CRM. Booked calls land in the one dashboard alongside the rest.
- Replies route into the inbound concierge (the src webhook), which books or hands off.
- STOP feeds the shared permanent suppression list.

## 8. PRESS GO steps

Nothing below was executed.

1. **Set up the WhatsApp Business Platform (Cloud API)** via Meta or a BSP (Twilio / 360dialog / Wati
   etc.). Register and verify the business and the sending number.
2. **Coordinate with the src team:** confirm the inbound concierge webhook endpoint is the message
   handler for this number (this doc does not build it).
3. **Register and submit templates A, B, C** (section 5) for Meta approval. Wait for approval before
   sending.
4. **Build opt-in capture** (section 3): website "Chat on WhatsApp" CTA (already wired to the
   `Contact` pixel event), click-to-WhatsApp ad option, and number-collection consent at events/forms.
   Store opt-in source and timestamp.
5. **Build the opted-in list** from first-party sources only. No cold numbers.
6. **Set the Cal.com link with UTMs** as the template booking variable.
7. **Wire suppression and CRM tagging** (STOP -> shared suppression; bookings -> one dashboard).
8. **Send a small test broadcast** to opted-in friendly contacts. Check rendering, the booking link,
   and STOP handling. Then roll out in small batches to protect the quality rating.

**Press-go gate:** do not broadcast until templates are approved, opt-in is recorded for every
recipient, STOP is wired, and a test batch rendered correctly. A cold or sloppy first blast throttles
the number permanently.

## 9. Safety

No WhatsApp account or API was purchased or provisioned, no template submitted, no message sent, no
list built. The inbound concierge webhook was not touched (it is the src team's work). No credentials
used. No git command was run. Everything is a hand-back.
