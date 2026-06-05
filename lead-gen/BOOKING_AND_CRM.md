# Booking and CRM (LEAD-05)

> The booked-call path: how a positive reply becomes a call on the calendar, where leads are
> captured, and how outbound joins the same funnel as the website agent's leads. One funnel, one
> dashboard. No em dashes. Nothing here was purchased or wired live; it is the plan to press go.

## 1. The goal

Every interested prospect ends on the **same calendar** and in the **same lead record**, whether they
came from outbound email or from the website concierge (the Phase 3 agent). The number that matters
is **booked calls**, and it should be countable in one place.

## 2. Booking link setup (Cal.com)

1. Create a **Cal.com** account (free tier is enough at launch).
2. Create one event type: **"intelbase OS - 15 min intro call"**, 15 minutes, with buffer, limited
   to business hours across the target timezones (HK/APAC + the English markets you target).
3. Add qualifying questions to the booking form: company, company size, what they want the OS to run,
   and "how did you hear about us" (so outbound vs site-agent attribution is captured at booking).
4. Connect your real calendar (Google Calendar) so slots stay accurate and double-booking is
   impossible.
5. Set the resulting URL as the `{{booking_link}}` token used in the sequences (steps 4 and 5).
6. **Use the same Cal.com event/link on the website's Book-a-call CTA** and in the Phase 3 agent's
   booking action (AGENT-03). One link everywhere means one source of truth for booked calls.

## 3. How a positive reply becomes a call

The cold sequences ask for a reply, not just a click. So the path has two entry points:

**Path A - prospect clicks the booking link (steps 4/5):** they self-book on Cal.com. Done. The
booking lands on the calendar and creates/updates a lead record (section 4).

**Path B - prospect replies positively (any step):** the sequence stops on reply (sending tool does
this automatically). The operator (or an assisted reply) sends the booking link in a one-line
response: "Great. Grab whatever slot works here: {{booking_link}}." The prospect self-books.

Reply classification:
- **Positive** ("interested", "tell me more", "what's the price"): stop sequence, send booking link,
  move lead to "Engaged" in the CRM.
- **Objection / not now:** stop sequence, log the reason, optionally tag for a later re-touch.
- **Negative / unsubscribe:** stop sequence, suppress permanently (never email again), honor opt-out.

## 4. CRM and lead capture

At launch, do not buy a CRM. Use what the stack already includes:

| Need | Tool (launch) | Notes |
|------|---------------|-------|
| Outbound lead records + reply status | **Apollo CRM** (built in) or **HubSpot free** | Tracks each contact, sequence status, reply, and booking. |
| Booking records | **Cal.com** | Each booking is a record with the qualifying answers. |
| Single source of truth | One of the above, chosen as the master | Pick Apollo CRM or HubSpot free as the master and push Cal.com bookings into it. |

Minimum fields per lead: name, company, title, source (outbound sequence A/B/C or website agent),
status (New / Engaged / Booked / Lost), reply summary, and booking time if booked.

## 5. One funnel: outbound + website agent

This is the key tie-back. The Phase 3 website agent (AGENT-01..06) captures and persists leads from
site visitors. Outbound captures leads from email. They must converge.

```
                          OUTBOUND (this system)
   Apollo search -> verified list -> Smartlead sequences -> reply / click
                                                                 |
                                                                 v
   WEBSITE AGENT (Phase 3)                                  Cal.com booking
   visitor -> concierge qualifies -> AGENT-03 booking action ----+
                                                                 |
                                                                 v
                                          ONE CRM record (source-tagged)
                                                                 |
                                                                 v
                                   ONE DASHBOARD (Phase 3 DASH-01/02):
                              conversations, qualified leads, booked calls
```

Wiring rules:
- **Same Cal.com event/link** is used by: outbound sequences (`{{booking_link}}`), the website
  Book-a-call CTA, and the Phase 3 agent's booking action. So every booked call, regardless of
  source, lands on the same calendar.
- **Source tagging:** the Cal.com "how did you hear about us" field plus the CRM "source" field let
  you split outbound-sourced calls from site-agent-sourced calls while still counting them together.
- **Dashboard feed:** the Phase 3 dashboard (DASH-01/02) reads real captured leads. Outbound bookings
  flow into the same CRM/booking store the dashboard reads, so booked calls from email show up
  alongside booked calls from the site agent. One number for "booked calls this week."

What is left to wire at press-go (a hand-back, see RUNBOOK.md):
- Connect Cal.com to the chosen master CRM (so bookings create/update lead records).
- Point the website Book-a-call CTA and the Phase 3 agent booking action at the same Cal.com link.
- Confirm the dashboard reads the shared CRM/booking store so outbound bookings appear in it.

## 6. Definition of done for the booked-call path

- One Cal.com event used by outbound, site CTA, and the site agent.
- Every positive reply or click can reach that calendar in one step.
- Every lead lands in one CRM with a source tag and status.
- Booked calls from both sources are countable in one dashboard view.
