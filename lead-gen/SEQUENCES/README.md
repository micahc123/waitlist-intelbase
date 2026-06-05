# Sequences (LEAD-03)

Two deliverability-safe cold email sequences selling **intelbase OS**, plus importable files.

## Files

| File | What it is |
|------|------------|
| `sequence-1-agencies-and-services.md` | Sequence 1 - full copy, 5 steps, for Apollo Saved Search A (agencies / B2B services, HK + APAC). |
| `sequence-2-saas-founders-and-growth.md` | Sequence 2 - full copy, 5 steps, for Apollo Saved Search B (B2B SaaS founders / growth leads). |
| `sequences.csv` | Both sequences flattened for spreadsheet / import (one row per step). |
| `sequences.json` | Both sequences structured for programmatic import into Smartlead / Apollo. |

## Personalization tokens (used in all copy)

| Token | Meaning | Source |
|-------|---------|--------|
| `{{first_name}}` | Prospect first name | Apollo |
| `{{company}}` | Company name | Apollo |
| `{{title}}` | Prospect job title | Apollo |
| `{{industry}}` | Company industry | Apollo |
| `{{signal}}` | Optional dynamic hook (for example "saw you're hiring for growth") | Apollo signal / Clay enrichment; fall back to a neutral line if empty |
| `{{sender_name}}` | intelbase sender | Static per inbox |
| `{{booking_link}}` | Cal.com booking URL | See BOOKING_AND_CRM.md |

**Token safety rule:** every token must have a fallback. If `{{signal}}` is empty, the sender tool
should substitute a neutral clause, never render a blank or "{{signal}}". Test with a few empty-token
contacts before launch.

## Deliverability principles baked into the copy

- Short. Plain text. No images, no tracking pixels on the cold opener, one link at most per email
  and never in the first email.
- No spam-trigger words ("guarantee", "free money", "act now", "100%").
- No em dashes (house style). Conversational, lowercase-friendly subject lines.
- Lead with the **autonomous front office** value and the **dogfood proof** (the OS runs on
  intelbase's own site and outbound - this email is partly the product working).
- One clear, low-friction ask per email. The call-to-action escalates gently across steps.
- See DELIVERABILITY_SETUP.md for sending limits, ramp, and the do-not-blast rules.

## Timing (both sequences, business days only)

| Step | Send day (relative) | Type |
|------|---------------------|------|
| 1 | Day 0 | Opener |
| 2 | Day 3 | Value + proof |
| 3 | Day 6 | Short nudge / different angle |
| 4 | Day 10 | Case-for-the-call |
| 5 | Day 14 | Breakup |

All steps stop immediately on reply (positive or negative). Positive replies route to booking per
BOOKING_AND_CRM.md.
