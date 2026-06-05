# ICP and Apollo Search Definitions (LEAD-02)

> Who intelbase OS is for, and the exact Apollo filters to find them. Specific enough to recreate
> the saved searches by hand. Product sold = **intelbase OS** (the autonomous AI operating system
> that runs a business's front office and growth). Buyer pain = drowning in manual front-office work
> and fragmented AI tools, wants pipeline without hiring a sales+marketing team.

## 1. Ideal Customer Profile

### Who buys intelbase OS

The buyer is a founder or growth lead at a **small-to-mid B2B services, agency, or SaaS company**
that (a) sells via booked calls / demos, (b) has inbound and outbound that is currently manual or
half-automated, and (c) is curious about AI but is **not yet operational with it** (the ~31%
intent-to-execution gap from the research). They feel the pain of: missed website leads, no time to
do outbound, follow-ups falling through, and "too many AI tools, none wired together."

### Firmographics

| Attribute | Target |
|-----------|--------|
| Company headcount | 2–50 (sweet spot 5–30). Big enough to feel the pain and pay a retainer, small enough to have no sales+marketing team. |
| Company type | B2B services, marketing/creative agencies, consultancies, professional services, and B2B SaaS. Service businesses that sell via a call. |
| Revenue (where available) | ~US$0.5M–10M annual. Below that, no budget; above, they hire teams instead. |
| Geography | **Primary: Hong Kong + APAC English-friendly markets** (HK, Singapore, Australia, New Zealand). **Secondary: English markets** (UK, Ireland, Canada, US, UAE/Dubai). English-language outbound only this milestone. |
| Business model signal | Sells via booked calls / demos / consultations (so "books your calls" is a direct value prop). |

### Buyer titles (the people you actually email)

- Founder, Co-Founder, Owner
- CEO, Managing Director
- Head of Growth, Head of Marketing, Marketing Director, CMO
- Head of Sales, Sales Director, VP Sales, Revenue / RevOps lead
- Head of Operations, COO, Operations Director (for the front-office / ops angle)

Prioritize **Founder / CEO / Head of Growth** in small companies (they own the buying decision and
feel the pain personally). In 20–50 headcount firms, add **Head of Marketing / Head of Sales**.

### Buying signals (raise priority when present)

- Recently hiring for "growth," "SDR," "marketing," or "operations" roles (they feel the gap, may
  buy a system instead of a headcount).
- Small or no in-house marketing/sales team (the OS replaces the team they do not have).
- Already running ads or a website with a contact form but no chat/booking automation (intelbase OS
  upgrades exactly that).
- Uses a basic website builder / no marketing automation tech detected (room for the OS).
- Recent funding or growth-stage signals (budget + pressure to scale pipeline).

### Anti-ICP (exclude - do not waste sends)

- Enterprises 200+ headcount (they buy governed/on-prem; out of small-agency reach this milestone).
- Companies that already sell an AI agent / AI OS product (competitors).
- Pure B2C, retail, restaurants, and physical-world-dependent businesses (the research flags AI
  struggles with off-screen/physical work; our offer does not fit).
- Solo freelancers with no revenue (no budget for a retainer).
- Non-English-primary regions this milestone (deliverability + reply handling are English only now).

## 2. Apollo search definitions (recreate these as Saved Searches)

Build **three saved searches**, each maps to a sequence variant. Apply the verification and
exclusion rules in DELIVERABILITY_SETUP.md before any contact enters a sequence.

### Saved Search A - "Agencies and B2B services (HK + APAC)"

People filters:
- **Job titles (include):** Founder, Co-Founder, Owner, CEO, Managing Director, Head of Growth,
  Head of Marketing, Marketing Director, Director of Marketing, CMO
- **Seniority:** Owner, Founder, C-Suite, VP, Director, Head
- **Email status:** Verified only

Company filters:
- **Employees:** 2–50 (Apollo ranges: 1–10, 11–20, 21–50)
- **Industry / keywords:** Marketing & Advertising, Management Consulting, Information Technology &
  Services, Design, Professional Services; company keywords: "agency", "consultancy", "studio",
  "marketing", "creative", "B2B services"
- **Location (HQ):** Hong Kong, Singapore, Australia, New Zealand
- **Exclude:** companies with keywords "AI agency", "AI agent", "chatbot platform", "lead generation
  software" (competitors); headcount 200+

### Saved Search B - "B2B SaaS founders and growth leads (English markets)"

People filters:
- **Job titles (include):** Founder, Co-Founder, CEO, Head of Growth, Head of Marketing, VP
  Marketing, Head of Sales, VP Sales, Revenue lead, RevOps
- **Seniority:** Founder, C-Suite, VP, Director, Head
- **Email status:** Verified only

Company filters:
- **Employees:** 5–50
- **Industry / keywords:** Computer Software, SaaS, Internet, Information Technology & Services;
  company keywords: "SaaS", "software", "platform", "B2B"
- **Location (HQ):** United Kingdom, Ireland, Canada, United States, Singapore, Australia, UAE
- **Technographics (optional signal):** uses a website chat tool, a basic CRM (HubSpot free,
  Pipedrive), or no marketing automation detected
- **Exclude:** 200+ headcount; AI-agent / AI-OS competitors; cybersecurity and dev-tools companies
  that sell to engineers (offer fit is weak)

### Saved Search C - "Ops-heavy services with a hiring/growth signal"

People filters:
- **Job titles (include):** Founder, Owner, CEO, COO, Head of Operations, Operations Director, Head
  of Growth
- **Seniority:** Owner, Founder, C-Suite, VP, Director, Head
- **Email status:** Verified only

Company filters:
- **Employees:** 5–50
- **Industry / keywords:** Professional Services, Consulting, Staffing & Recruiting, Real Estate
  services, Financial services (advisory), Legal services
- **Location (HQ):** Hong Kong, Singapore, Australia, United Kingdom, Canada, United States
- **Buying signal:** companies **actively hiring** for growth/marketing/sales/SDR/ops roles (use
  Apollo's "Job postings" / hiring filter where available)
- **Exclude:** 200+ headcount; B2C/retail; competitors

## 3. From search to sequence (routing)

| Saved Search | Feeds sequence | Why |
|--------------|----------------|-----|
| A - Agencies / B2B services (HK + APAC) | Sequence 1 (Agencies and services) | Agency angle: front office runs itself, calendar fills without a sales hire. Dogfood proof lands hard with agencies. |
| B - B2B SaaS founders / growth leads | Sequence 2 (SaaS founders and growth) | Pipeline-without-a-team angle, ROI dashboard, autonomous lead gen. |
| C - Ops-heavy services + hiring signal | Sequence 1 (with the ops/hiring opener) or Sequence 2 | Use the hiring signal as the personalization hook ("saw you're hiring for growth - what if the system did it instead"). |

## 4. Recreate checklist

To rebuild the targeting from scratch:
1. In Apollo, create three Saved Searches named A, B, C above with the exact filters listed.
2. Set **Email status = Verified** on all three (Apollo-side first pass).
3. Export contacts, then run them through MillionVerifier (second pass) before import to Smartlead.
4. Apply the exclusion lists (competitors, 200+ headcount, anti-ICP) as Apollo "exclude" filters so
   they never enter the pool.
5. Route each search to its sequence per the table above.
