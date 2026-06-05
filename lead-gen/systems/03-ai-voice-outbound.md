# 03 - AI Voice Outbound (GROW-03)

> Outbound AI voice calling that books discovery calls, framed as intelbase dogfooding its own
> **AI Voice Receptionist** module (the Concierge, for the phone). Provider options and rough costs,
> a call script and flow with hard guardrails, HK and general compliance notes, and press-go setup.
> No em dashes. Nothing here was bought, dialed, or sent; it is build-to-press-go.

## 1. Why this exists and what it dogfoods

intelbase sells an **AI Voice Receptionist** module. The most credible way to sell it is to run it on
intelbase's own pipeline: an AI voice agent that calls ICP prospects (the same Apollo ICP) or warm
inbound leads, has a short qualifying conversation, and books a discovery call. When a prospect says
"wait, the thing that just called me is the product?" that is the dogfood proof, the same move the
website concierge makes.

Use it for two jobs:
1. **Warm follow-up calls** (best fit, lowest risk): call leads who already engaged (form, reply,
   reactivation responder, abandoned booking) to book the call live. Higher answer and consent rates.
2. **Cold ICP calls** (higher risk, stricter compliance): call Apollo ICP contacts with a verified
   business phone. Treat as a channel that runs *alongside* email/LinkedIn on the same ICP, not a
   replacement, and only in markets where cold B2B calling is permitted with the consent rules below.

Start with warm follow-up. It is where AI voice books the most calls with the least compliance risk.

## 2. Provider options and rough costs

AI voice calling = a voice agent platform (speech-to-text + LLM + text-to-speech + telephony) plus
per-minute telephony. Costs are list-price USD estimates; confirm at purchase. Keep total tooling
within the ~10k HKD/mo ceiling across all systems.

| Provider | What it is | Rough cost | Notes |
|----------|-----------|------------|-------|
| **Vapi** | Developer voice-agent platform, bring-your-own LLM/voices, good call control | ~US$0.05–0.15/min usage + provider/telephony pass-through; low/no monthly floor | Flexible, fast to prototype, good for a small agency. Strong fit for dogfooding because you control the flow. |
| **Bland AI** | Outbound-focused AI calling, simpler to launch campaigns | usage-based, similar per-minute range, some plans have a monthly minimum | Purpose-built for outbound calling campaigns; less engineering needed. |
| **Retell AI** | Voice-agent platform, conversational quality focus | per-minute usage, low monthly floor | Good conversational realism; similar setup to Vapi. |
| **Synthflow / Air.ai class** | No-code voice agents | monthly plan + per-minute | No-code option if you want zero engineering; verify current pricing, plans vary. |
| Telephony number (HK / target country DID) | The phone number you call from | ~US$1–5/mo per number + per-minute | Usually via the platform's telephony (often Twilio under the hood). Use a real, traceable business caller ID. |

**Recommended start:** **Vapi or Bland** on usage-based pricing, one outbound number, low volume.
A realistic dogfood budget is **US$50–150/mo** of calling at low volume (a few hundred minutes),
which sits comfortably inside the ceiling alongside the rest of the stack. Scale only after it books.

**Voice and LLM:** use a natural TTS voice (the platform's premium voice), an LLM with low latency,
and an English voice profile (the ICP is English-language this milestone, matching the email engine).
Multilingual (Cantonese/Mandarin) is a later upgrade tied to the Multilingual Front Desk module.

## 3. Call flow and script (with guardrails)

Keep calls short (target under 2 minutes), single goal: **book the discovery call** or **get a
callback time**, never to close or to quote. The agent's job is to qualify lightly and book.

### Flow

```
1. Open + identify (who, why, ask permission to continue)
2. One-line value + the dogfood hook
3. Light qualify (one or two questions max)
4. Ask for the booked call -> offer to send the link / book live
5. Handle: yes -> book/send link | maybe -> callback time | no -> thank + opt-out + end
6. Guardrail triggers at any point -> hand off / leave callback, never improvise
```

### Script (warm follow-up variant)

**Open:**
"Hi, is this {{first_name}}? Hi {{first_name}}, this is an AI assistant calling on behalf of
intelbase. You recently looked at us about running your front office and lead gen on AI. Is now an
okay moment for thirty seconds?"

(If no: "No problem, when is a better time to reach you?" Capture callback, end politely.)

**Value + dogfood hook:**
"Quick version: intelbase OS answers your website visitors, qualifies leads, books calls, and runs
follow-up and ads on its own, with a guardrail so it never invents a price or a promise. And the
honest proof is, this call is the product. The same kind of AI assistant is what would answer your
phone and your site."

**Light qualify (max two):**
"So I point you the right way, does {{company}} mostly get leads from inbound on the site, outbound,
or both right now?" (One follow-up at most.)

**Ask for the call:**
"The best next step is a quick fifteen-minute call with the team where you see the live dashboard.
Can I text or email you a link to grab a time, or would you like me to find a slot with you now?"

**Yes:** "Great. I will send that link to the number/email we have for you right now. You will get a
text from intelbase with the calendar." (Trigger the SMS/email with `{{booking_link}}`.)

**Maybe / busy:** "Totally fine. When is a good time for the team to call you back?" Capture, end.

**No:** "Understood, thanks for your time. I will make sure we do not call you again. Have a good
day." (Flag for permanent suppression.)

### Hard guardrails (the agent must obey, non-negotiable)

1. **Never invent a price, a discount, a timeline, or a claim.** If asked "how much," the answer is
   always: "Pricing is set after the call so it fits what you actually need. That is exactly what the
   call covers." Never state a number.
2. **Never promise a result** ("you will get X leads"). Stay on mechanics, not guarantees.
3. **If the prospect asks anything the agent is not certain about, hand off.** Say: "Good question,
   I want to get that exactly right, so I will have a person from intelbase follow up. What is the
   best way to reach you?" Capture and end. Do not guess.
4. **If the prospect is annoyed, confused, or asks to stop, stop immediately,** confirm opt-out, end.
5. **Always disclose it is an AI** in the opening line. No pretending to be human.
6. **Never argue or re-pitch after a clear no.**
7. **Leave a callback path** if no answer / voicemail (section below), never a hard sell on voicemail.
8. **Stay under the time goal.** If the call runs long, move to "let me get you on the calendar."

### Voicemail / no-answer

Short, honest, one ask: "Hi {{first_name}}, this is an AI assistant from intelbase, following up on
your interest in running your front office on AI. No need to call this number back; I will text you a
link to book a quick call. If you would rather not hear from us, just let us know. Thanks."

## 4. Compliance and consent (HK and general)

Voice is the most regulated channel here. Treat compliance as a gate, not a footnote.

- **Disclose AI up front, every call.** Several jurisdictions require or strongly expect disclosure
  that the caller is an automated/AI system. intelbase discloses in line one regardless.
- **Honor do-not-call and opt-out instantly and permanently.** Maintain a suppression list; never
  call a number after a stop request.
- **Hong Kong:** the **Unsolicited Electronic Messages Ordinance (UEMO)** governs commercial
  electronic messages and applies to certain pre-recorded/automated voice calls; you must honor
  unsubscribe requests and not call numbers on the relevant do-not-call registers. Check current DNC
  register rules before any HK calling. **HK PDPO** governs use of personal data, including phone
  numbers, so only call numbers you obtained lawfully and use them for the stated purpose. Confirm the
  current position before switching on cold voice in HK.
- **United States:** TCPA and state law treat AI/auto-dialed and pre-recorded calls strictly; prior
  consent is often required, and recent rules tighten AI-voice calling. Be very cautious with cold US
  voice. Warm leads who gave a number for contact are far safer; still honor DNC and opt-out.
- **General:** prefer calling **business numbers** of business contacts (B2B), keep accurate caller
  ID (no spoofing), call only in local business hours, record only with consent where required, and
  keep call logs.
- **Default posture:** start with **warm leads who already gave a number** (lowest risk). Only
  consider cold ICP voice in a specific market after confirming that market's rules, and prefer
  markets with clearer B2B allowances. When unsure about a market, do not cold-call it; use email and
  LinkedIn there instead.

## 5. Routing booked calls into the same funnel

- The voice agent books onto the **same Cal.com event** as everything else, or sends the
  `{{booking_link}}` by SMS/email during the call (see `../BOOKING_AND_CRM.md`).
- Tag `source = voice_outbound` (and warm vs cold) in the master CRM so booked calls are countable
  separately while still landing in the one dashboard.
- Callbacks captured by the agent become CRM tasks for a human.
- Opt-outs from voice feed the **same permanent suppression list** used by email and WhatsApp.

## 6. PRESS GO steps

Nothing below was executed.

1. **Pick a provider** (Vapi or Bland recommended to start). Create the account.
2. **Provision one outbound phone number** (a real, traceable business DID for your calling market).
3. **Build the agent:** load the script and the hard guardrails (section 3) as the system prompt /
   flow. Configure the AI-disclosure opening line, the price-deflection rule, and the hand-off rule.
4. **Wire the booking action:** on a "yes," trigger an SMS/email with the Cal.com `{{booking_link}}`,
   tagged `source = voice_outbound`.
5. **Wire suppression:** any "no"/opt-out writes to the shared suppression list; the dialer checks it
   before every call.
6. **Load a small warm-lead list first** (people who already gave a number and engaged). Do **not**
   start with cold.
7. **Compliance pass:** confirm AI-disclosure is in every call, DNC/opt-out is honored, calling hours
   are local business hours, and the target market's voice rules (section 4) are confirmed.
8. **Test on yourself and one or two friendly numbers.** Verify the guardrails actually trigger (ask
   it the price; it must deflect, not invent).
9. **Run a small warm batch,** review recordings/transcripts, tune the script, then scale slowly.

**Press-go gate:** do not dial real prospects until the guardrails are verified live (it must refuse
to invent a price and must hand off when unsure) and the compliance posture for that market is
confirmed. A voice agent that hallucinates a price is a legal and reputation risk, not just a bug.

## 7. Safety

No provider was purchased, no number provisioned, no call placed, no list loaded. No credentials
used. No git command was run. Everything is a hand-back.
