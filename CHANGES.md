# CHANGES

Pivot from generalist AI automation agency to AI-powered social and ad automation for lead generation. Higgsfield is the core creative engine. Every file below was touched for that pivot.

## Site copy and structure

- `src/app/layout.tsx` — Rewrote SEO metadata: new title (AI ads and social automation), one-sentence description, niche keywords, and added Open Graph + Twitter card tags.
- `src/components/hero.tsx` — New plain-language headline ("We run your ads and social on AI..."), short sub-headline, reduced to one CTA (removed the WhatsApp button and its now-unused imports), and updated stats (brands on system, 30 to 50 ad variations).
- `src/components/services.tsx` — Replaced the 7 old services (OpenClaw, Business Automation, Social, n8n, RAG, Custom AI, Claude/MCP) with the 5 new ones in order: AI Ad System, Organic Social Pipeline, Lead Nurture Automation, Landing Page and Funnel Builds, Performance Dashboard. New section heading.
- `src/components/process.tsx` — Rewrote the 3 steps to Discover, Build, Launch and optimize, with new bullets and heading.
- `src/components/proof.tsx` — New KPIs ("Brands running on our system", "Ad variations tested per month"), kept the 24h quote stat, and rewrote all 3 testimonials to the new positioning (agency replacement, lead volume, content without hiring). New section headings.
- `src/components/pricing.tsx` — Replaced the single custom quote with three flat-quote tiers (Starter, Growth, Custom). Growth is featured as "Most popular" and called out as the default. No prices shown; quote after the call.
- `src/app/globals.css` — Added the three-tier pricing grid styles (`.pricing-tiers`, `.tier`, etc.), responsive to one column under 900px. Removed em dashes from two code comments.
- `src/components/footer.tsx` — New service links (the 5 services) and a new brand description.
- `src/components/cta.tsx` — New headline/sub-headline/footer copy and updated the WhatsApp prefill message.
- `src/components/quote-modal.tsx` — Scope dropdown now lists the 3 tiers plus "Not sure yet"; updated labels, placeholder, and modal copy. Removed an em dash.

## Work page (/work)

- `src/components/past-projects.tsx` — New filter categories (AI Ads, Organic Social, Lead Nurture, Landing Pages, Dashboards), new page heading and intro, relabeled card field, removed an em dash.
- `src/lib/projects-data.ts` — New `ServiceKey` set and a rewritten project list focused on lead-gen wins. Removed the unused legacy `services` export that still held old positioning copy.

## Dead code cleaned (not imported anywhere, but contained old positioning or em dashes)

- `src/lib/ebooks.ts` — Removed em dashes and trimmed legacy tool name-drops. The playbook products themselves were left intact. Not rendered by any route.
- `src/components/ui/timeline.tsx` — Rewrote the subhead to the new niche and removed an em dash. Not imported anywhere.
- `src/lib/meta-pixel.ts` — Removed em dashes from code comments (not rendered).

## Marketing

- `marketing/meta-ads-v2.md` — New file. 5 Meta ad variations (primary text, headline, description, hook angle) covering the requested angles, plus a short audience targeting section. No em dashes.

## Notes and judgment calls

- **Deliverable path.** The brief mentioned ad code in `~/Developer/adsmanager`, but the deliverable path given was `/marketing/meta-ads-v2.md`. I created it inside this repo (`marketing/`) alongside `CHANGES.md`, since that is where the rest of the deliverables live. The separate `adsmanager` repo (which has its own `copy/ad_copy.yaml`) was not modified.
- **Stats are placeholders.** "40+ brands" softens the old "50+". The "4.9/5" rating and "06 spots open" were carried over from the old site. The only results metric added is "30 to 50 ad variations tested per month", which is defensible because it is how the system actually works. Confirm or replace these before going live.
- **Testimonials are illustrative.** Quotes use ranges ("about a third", "roughly doubled") rather than fabricated hard numbers. Names and companies were carried over from the old site. Swap in real quotes when available.
- **WhatsApp.** Removed from the hero (to honor "one CTA") and from the pricing section (now three tier buttons). It still appears in the final CTA section and the footer.
- **`src/components/logos.tsx`** is unused (not imported) and contains only brand names with no positioning, so it was left untouched.
- **Build not run.** `node_modules` is empty in this environment, so `next build` / `tsc` could not be run. All changes are copy and data only; imports, type unions, and the `ServiceKey` set were verified consistent by hand. Run `npm install && npm run build` to confirm.

---

# Third pivot: intelbase OS, the autonomous AI Operating System

Pivot from "AI ads and social automation for lead generation" to **intelbase OS**, an autonomous AI operating system that runs a business's front office on its own: it answers every visitor, qualifies every lead, books calls, nurtures follow-ups, and runs the ads, with guardrails so it never goes off-script and hands off to a human the moment it is unsure. The product is **intelbase OS**; the company stays **intelbase**. Source of truth: `marketing/messaging-foundation.md`. The prior lead-gen / Higgsfield positioning is fully recoverable in git.

## Site copy and structure

- `src/app/layout.tsx` — Rewrote the SEO metadata values inside the existing metadata export (no structural changes): new title ("intelbase. The Autonomous AI Operating System for Your Business."), new description (front office on autopilot with guardrails, one dashboard), new keyword set (autonomous AI operating system, AI for business, AI lead generation, AI website chatbot, AI front office, autonomous outbound, AI ad automation), and matching OG/Twitter title, description, and image alt. Card type stayed `summary_large_image`.
- `src/components/hero.tsx` — New headline ("An AI operating system that runs your front office, autonomously.") and sub-headline (the approved intelbase OS line), em dash rewritten to a comma. Single primary CTA kept ("Book a free call"). Eyebrow badge changed to "Autonomous, with guardrails" plus the carried-over "6 spots open". Reframed the four hero stats to the autonomy story (answered in seconds, five-in-one, client rating, zero hires).
- `src/components/services.tsx` — Replaced the five lead-gen services with the five intelbase OS capabilities in order: AI Website Concierge, Autonomous Lead Generation, Lead Nurture on Autopilot, AI Ad Engine, One Control Dashboard. New section heading ("One OS. Five things it runs for you.") and a sub that leads with the guardrails / hand-off angle. Each capability's modal copy (longDesc, includes, outcomes) rewritten to the autonomy framing. Icons reused from the existing `IconName` union, no new icons.
- `src/components/process.tsx` — Rewrote the three steps to Map / Build / Go live autonomously, per the messaging foundation, with new bullets and a new heading ("Three steps to a front office that runs itself.").
- `src/components/proof.tsx` — Rewrote KPIs to the autonomy story (answered 24/7, zero hires, ad variations per month, spots open) and led the section with the dogfood angle ("The chat on this site is the product."). All three testimonials reframed to the autonomy benefit and the guardrails/trust angle; ranges and mechanics only, no fabricated absolutes. New section headings.
- `src/components/pricing.tsx` — Renamed the tiers to Launch / Growth (Most popular, default) / Custom per the pricing framing. Growth stays featured. Setup-plus-monthly framing, quote after the call, no public hard prices. Kept the existing tier-grid structure and classes. New heading and positioning note.
- `src/components/cta.tsx` — New headline/sub-headline/footer copy ("Switch on the OS. Let it run.") and updated the WhatsApp prefill message to the autonomous front-office positioning.
- `src/components/footer.tsx` — New brand description (front office on autopilot, guardrails, one dashboard) and the services column relabeled to the five capabilities under an "The OS" heading.
- `src/components/quote-modal.tsx` — Scope dropdown rewritten to Launch / Growth (full OS) / Custom / "Not sure yet"; updated the default scope value, the eyebrow, sub-copy, textarea placeholder, the form-foot note, and the success message to remove the "flat quote in 24h" framing in favor of "we scope on the call."

## Work page (/work)

- `src/components/past-projects.tsx` — New filter categories aligned to the five capabilities (Concierge, Lead Generation, Lead Nurture, Ad Engine, Dashboards), new page heading ("Front offices we run on intelbase OS.") and intro, relabeled the "What we built" card field to "What the OS runs," and updated the footer count line.
- `src/lib/projects-data.ts` — Rewrote the `ServiceKey` union to `concierge | leadgen | nurture | ads | dashboard` and rewrote all 18 projects to the autonomous front-office positioning (concierge answering 24/7, autonomous outbound, autopilot nurture, AI ad engine, control dashboard). Types kept internally consistent with `past-projects.tsx`. No legacy exports remain.

## Dead code cleaned (not imported anywhere, but contained old positioning)

- `src/components/ui/timeline.tsx` — Rewrote the subhead to the Map-to-go-live autonomous path. Not imported anywhere.
- `src/lib/ebooks.ts` — Reframed the social/ads playbook entry (title, subtitle, description, bullets) to the autonomous ad-engine story and dropped the legacy Higgsfield / OpenClaw / n8n name-drops. The other two playbooks were left intact. Not rendered by any route.
- `src/lib/meta-pixel.ts` — Scanned; comments are positioning-neutral and contained no em dashes, so it was left unchanged.

## Notes and judgment calls

- **House style.** No em dashes anywhere in shipped copy or code comments (verified with a repo-wide search of `src/`). The em dashes in `marketing/messaging-foundation.md` were rewritten as commas in the JSX, per the brief. The approved primary hero direction was used, with its em dash rewritten to a comma.
- **Stats are placeholders.** The "4.9/5" rating and "06 spots open" were carried over from the prior site. The autonomy-framed stats (answered 24/7, five-in-one, zero hires) describe how the OS works rather than asserting hard outcome numbers. The "30 to 50 ad variations a month" mechanic is retained because it is how the ad engine actually runs. Confirm or replace before go-live.
- **Testimonials are illustrative.** Quotes were reframed to the autonomy and guardrails benefit; names and companies were carried over from the prior site. Swap in real quotes before go-live, per the messaging foundation.
- **No new framework code.** Per the environment constraints, only copy and data in existing client components and data files were edited. No new Next.js APIs, dependencies, files, or components were introduced. `layout.tsx` changed only the values inside the existing metadata export.
- **Build not run (SITE-07 unverified).** `node_modules` is absent in this environment, so `next build` / `tsc` could not be run, and this version is a modified/breaking Next.js fork. All changes are copy and data only; imports, the `IconName` unions, and the rewritten `ServiceKey` set were verified consistent by hand. The user must run `npm install && npm run build` to confirm the build passes.
