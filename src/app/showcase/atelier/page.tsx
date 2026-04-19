import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { ArrowUpRight, Sparkles } from "lucide-react";

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--at-serif",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--at-sans",
});

export const metadata: Metadata = {
  title: "Atelier Noir — The website they'll remember.",
  description:
    "A two-person design studio shipping premium sites in 10 business days. Claude Code does the typing. We do the taste. Your competitors will wonder who you hired.",
};

const WORK = [
  { tag: "SAAS · MKT", title: "Orchard", note: "Plant care SaaS · full rebrand + site", tint: "from-emerald-900/80 to-lime-700/60" },
  { tag: "E-COM", title: "Kindred Goods", note: "Heirloom homewares · shop + editorial", tint: "from-amber-900/80 to-rose-800/60" },
  { tag: "B2B", title: "Harbor Finance", note: "Fractional CFOs · lead-gen site", tint: "from-slate-800/90 to-teal-800/60" },
  { tag: "STUDIO", title: "North & Co.", note: "Architects · portfolio + CMS", tint: "from-stone-800/90 to-stone-700/60" },
];

const PROCESS = [
  { day: "DAY 01", title: "Intake call", body: "90 minutes. You talk. We record. By end of day, a written brief is in your inbox." },
  { day: "DAY 02–03", title: "Taste gate", body: "Three design directions. Mood, type, one page each. You pick one; we kill the others." },
  { day: "DAY 04–07", title: "Build", body: "Live preview URL updated every few hours. Comment in-line. No dark-room reveals." },
  { day: "DAY 08–09", title: "Copy + content", body: "We rewrite everything. Brand voice, SEO basics, image selection. You approve once." },
  { day: "DAY 10", title: "Ship", body: "Deployed to Vercel. Domain connected. Analytics live. Handover deck in Notion." },
];

export default function AtelierPage() {
  return (
    <main
      className={`${serif.variable} ${sans.variable} min-h-screen bg-[#F5F1E8] text-[#14110E] antialiased`}
      style={{ fontFamily: "var(--at-sans)" }}
    >
      {/* Warm paper texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* NAV */}
      <header className="relative z-10 border-b border-[#14110E]/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-baseline gap-2.5">
            <span
              className="text-[18px] font-semibold tracking-tight"
              style={{ fontFamily: "var(--at-serif)" }}
            >
              Atelier <span className="italic">Noir</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#14110E]/50">
              est. 2026
            </span>
          </div>
          <nav className="hidden items-center gap-7 text-[13px] text-[#14110E]/65 md:flex">
            <a href="#work" className="hover:text-[#14110E]">Work</a>
            <a href="#process" className="hover:text-[#14110E]">Process</a>
            <a href="#pricing" className="hover:text-[#14110E]">Pricing</a>
            <a href="#journal" className="hover:text-[#14110E]">Journal</a>
          </nav>
          <a
            href="#enquire"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#14110E] px-4 py-2 text-[12.5px] font-medium text-[#F5F1E8] hover:bg-[#2a2420]"
          >
            Enquire
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 pt-20 pb-28 sm:pt-28 sm:pb-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-[#14110E]/55">
            A two-person studio · Lisbon / Melbourne
          </p>
          <h1
            className="text-[clamp(3rem,9vw,7.5rem)] font-medium leading-[0.94] tracking-[-0.03em]"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            The website
            <br />
            <span className="italic text-emerald-900/85">they&apos;ll remember.</span>
          </h1>

          <div className="mt-14 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <p
              className="max-w-lg text-[17px] leading-[1.75] text-[#14110E]/75"
              style={{ fontFamily: "var(--at-sans)" }}
            >
              We ship one premium site per week. Typography-first, quietly
              confident, and built on a stack that makes your future
              developers thank you — not file tickets.
            </p>
            <div className="flex flex-col gap-3 sm:items-end">
              <a
                href="#enquire"
                className="inline-flex items-center justify-between gap-2 rounded-full bg-[#14110E] px-5 py-3 text-[13.5px] font-medium text-[#F5F1E8] hover:bg-[#2a2420]"
              >
                Start a project · from $2,500
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#work"
                className="text-[13px] text-[#14110E]/65 underline underline-offset-4 hover:text-[#14110E]"
              >
                See the work first
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUIET STATS BAND */}
      <section className="relative z-10 border-y border-[#14110E]/[0.08] bg-[#EDE7D8]/70 px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-6 text-left sm:grid-cols-4">
          {[
            { v: "84", l: "sites shipped" },
            { v: "10 days", l: "avg turnaround" },
            { v: "$3,820", l: "avg project value" },
            { v: "0", l: "support tickets missed" },
          ].map((s) => (
            <div key={s.l}>
              <p
                className="text-[40px] font-medium leading-none tracking-tight"
                style={{ fontFamily: "var(--at-serif)" }}
              >
                {s.v}
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#14110E]/55">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="relative z-10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#14110E]/55">
                Selected work · 2025–2026
              </p>
              <h2
                className="text-5xl font-medium tracking-tight sm:text-6xl"
                style={{ fontFamily: "var(--at-serif)" }}
              >
                Quiet sites. Loud results.
              </h2>
            </div>
            <a
              href="#enquire"
              className="hidden text-[13px] text-[#14110E]/60 underline underline-offset-4 hover:text-[#14110E] sm:inline"
            >
              Full archive →
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {WORK.map((w, i) => (
              <figure
                key={w.title}
                className={`group relative overflow-hidden rounded-2xl ${i % 3 === 0 ? "md:col-span-2" : ""}`}
              >
                <div
                  className={`relative aspect-[${i % 3 === 0 ? "16/7" : "4/5"}] bg-gradient-to-br ${w.tint}`}
                  style={{ aspectRatio: i % 3 === 0 ? "16/7" : "4/5" }}
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(at 30% 30%, rgba(255,255,255,0.25), transparent 60%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 mix-blend-overlay opacity-30"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 6px)",
                    }}
                  />

                  {/* site-style overlay: a fake heading card centered */}
                  <div className="absolute inset-0 flex items-center justify-center p-10">
                    <div className="w-full max-w-md rounded-md bg-[#F5F1E8]/95 px-6 py-5 shadow-2xl">
                      <p className="mb-1 text-[9.5px] uppercase tracking-[0.25em] text-[#14110E]/50">
                        {w.tag}
                      </p>
                      <p
                        className="text-[28px] font-medium tracking-tight text-[#14110E]"
                        style={{ fontFamily: "var(--at-serif)" }}
                      >
                        {w.title}
                      </p>
                      <p className="mt-1 text-[12px] text-[#14110E]/65">
                        {w.note}
                      </p>
                    </div>
                  </div>

                  <span className="absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                    live
                  </span>
                </div>
                <figcaption className="flex items-baseline justify-between pt-4">
                  <p
                    className="text-[20px] font-medium tracking-tight"
                    style={{ fontFamily: "var(--at-serif)" }}
                  >
                    {w.title}
                  </p>
                  <p className="text-[11.5px] uppercase tracking-[0.25em] text-[#14110E]/55">
                    {w.tag}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <section className="relative z-10 border-y border-[#14110E]/[0.08] bg-[#14110E] px-6 py-24 text-[#F5F1E8]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[#F5F1E8]/55">
            Kind words · Halcyon Studio
          </p>
          <blockquote
            className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-medium leading-[1.25] tracking-tight"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            <span className="italic text-[#F5F1E8]/50">&ldquo;</span>We talked to five
            studios. Atelier was the only one who showed up with a drawing on
            the intake call. Ten days later we had a site that my investors
            actually screenshotted.<span className="italic text-[#F5F1E8]/50">&rdquo;</span>
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F1E8]/10 ring-1 ring-[#F5F1E8]/20">
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "var(--at-serif)" }}
              >
                JK
              </span>
            </div>
            <div>
              <p className="text-[14px] font-medium">Jae Kim</p>
              <p className="text-[11.5px] uppercase tracking-[0.25em] text-[#F5F1E8]/55">
                Founder · Halcyon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="relative z-10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#14110E]/55">
            Process
          </p>
          <h2
            className="mb-14 text-5xl font-medium tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            Ten days. Five moves.
          </h2>

          <ol className="divide-y divide-[#14110E]/[0.1]">
            {PROCESS.map((p) => (
              <li
                key={p.day}
                className="grid gap-6 py-8 md:grid-cols-[180px_1fr_2fr]"
              >
                <p className="text-[11.5px] uppercase tracking-[0.25em] text-[#14110E]/55">
                  {p.day}
                </p>
                <h3
                  className="text-[22px] font-medium tracking-tight"
                  style={{ fontFamily: "var(--at-serif)" }}
                >
                  {p.title}
                </h3>
                <p className="text-[14.5px] leading-[1.7] text-[#14110E]/75">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="relative z-10 border-t border-[#14110E]/[0.08] bg-[#EDE7D8]/70 px-6 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14">
            <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#14110E]/55">
              Pricing · fixed fee
            </p>
            <h2
              className="max-w-2xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--at-serif)" }}
            >
              No retainers. No surprise invoices.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Essential",
                price: "$2,500",
                note: "from",
                bullets: [
                  "Landing page",
                  "Contact form + analytics",
                  "Typography system",
                  "Deployed to Vercel",
                ],
              },
              {
                name: "Plus",
                price: "$3,800",
                note: "from",
                bullets: [
                  "Five pages + CMS",
                  "Booking integration",
                  "Custom motion details",
                  "SEO + sitemap",
                ],
                featured: true,
              },
              {
                name: "Pro",
                price: "$5,500",
                note: "from",
                bullets: [
                  "Ten pages + CMS",
                  "Supabase-backed app features",
                  "Copy rewrite included",
                  "30-day polish window",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-7 ${
                  p.featured
                    ? "border-[#14110E] bg-[#14110E] text-[#F5F1E8]"
                    : "border-[#14110E]/15 bg-[#F5F1E8]"
                }`}
              >
                {p.featured && (
                  <span className="absolute right-5 top-5 rounded-full border border-[#F5F1E8]/30 bg-[#F5F1E8]/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                    Most picked
                  </span>
                )}
                <p
                  className={`mb-2 text-[10.5px] uppercase tracking-[0.3em] ${
                    p.featured ? "text-[#F5F1E8]/55" : "text-[#14110E]/55"
                  }`}
                >
                  Tier
                </p>
                <h3
                  className="text-[28px] font-medium tracking-tight"
                  style={{ fontFamily: "var(--at-serif)" }}
                >
                  {p.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-2">
                  <span
                    className="text-4xl font-medium tracking-tight"
                    style={{ fontFamily: "var(--at-serif)" }}
                  >
                    {p.price}
                  </span>
                  <span
                    className={`text-sm ${
                      p.featured ? "text-[#F5F1E8]/55" : "text-[#14110E]/50"
                    }`}
                  >
                    {p.note}
                  </span>
                </div>
                <ul className="mt-6 space-y-2.5 text-[14px]">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <span
                        className={`mt-[9px] h-1 w-5 shrink-0 ${
                          p.featured ? "bg-[#F5F1E8]" : "bg-[#14110E]"
                        }`}
                      />
                      <span
                        className={
                          p.featured ? "text-[#F5F1E8]/90" : "text-[#14110E]/80"
                        }
                      >
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#enquire"
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-medium ${
                    p.featured
                      ? "bg-[#F5F1E8] text-[#14110E] hover:bg-[#e8e1cd]"
                      : "border border-[#14110E] bg-transparent text-[#14110E] hover:bg-[#14110E] hover:text-[#F5F1E8]"
                  }`}
                >
                  Start with {p.name}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENQUIRE */}
      <section id="enquire" className="relative z-10 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#14110E]/55">
            Book a slot
          </p>
          <h2
            className="text-5xl font-medium leading-[1.05] tracking-tight sm:text-[5.5rem]"
            style={{ fontFamily: "var(--at-serif)" }}
          >
            One brief.
            <br />
            <span className="italic">Two weeks out.</span>
          </h2>
          <p
            className="mt-8 max-w-xl text-[16px] leading-[1.75] text-[#14110E]/75"
            style={{ fontFamily: "var(--at-sans)" }}
          >
            We take on one site a week. If the calendar is open, you can be
            live by the end of the month. If it isn&apos;t, we&apos;ll tell you the
            real date on the intake call.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <a
              href="mailto:studio@atelier-noir.co?subject=Project%20enquiry"
              className="inline-flex items-center gap-2 rounded-full bg-[#14110E] px-6 py-3 text-[14px] font-medium text-[#F5F1E8] hover:bg-[#2a2420]"
            >
              studio@atelier-noir.co
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-[#14110E] px-6 py-3 text-[14px] font-medium hover:bg-[#14110E] hover:text-[#F5F1E8]"
            >
              Instagram journal
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#14110E]/[0.1] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-3">
            <span
              className="text-[14px] font-medium"
              style={{ fontFamily: "var(--at-serif)" }}
            >
              Atelier <span className="italic">Noir</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#14110E]/55">
              © {new Date().getFullYear()} · Lisbon / Melbourne
            </span>
          </div>
          <Link
            href="/courses/website-builders-playbook"
            className="inline-flex items-center gap-2 rounded-full border border-[#14110E]/20 bg-transparent px-3.5 py-1.5 text-[11px] text-[#14110E]/70 hover:bg-[#14110E] hover:text-[#F5F1E8]"
          >
            <Sparkles className="h-3 w-3" />
            Built on the Intelbase Website Builder&apos;s Playbook
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
