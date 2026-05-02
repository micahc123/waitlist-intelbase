"use client";

import { motion } from "motion/react";

const tickerItems = [
  "50+ BUSINESSES AUTOMATED",
  "QUOTE IN 24H",
  "4.9/5 RATING",
  "YOU OWN EVERYTHING",
  "NO RETAINERS",
  "SHIP IN 72H AVG",
  "OPENCLAW · n8n · LANGGRAPH",
];

const stats = [
  { value: "50+", label: "Businesses automated" },
  { value: "24h", label: "Quote turnaround" },
  { value: "4.9", sub: "/5", label: "Average rating" },
  { value: "6", label: "Spots open this month" },
];

const testimonials = [
  {
    quote: "Paid for itself in six weeks. Replaced three SaaS tools and a VA.",
    name: "Eric Hong",
    role: "CEO, FindYourCareer",
  },
  {
    quote: "Live the day after our call. Cold email replies doubled the next week.",
    name: "Timothy Chen",
    role: "Head of Global Sales & Marketing, VIA Technologies",
  },
  {
    quote: "Wasted six months on a custom build. They shipped our RAG in 72 hours.",
    name: "Trenton Johnson",
    role: "Founder, BizGenius",
  },
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Proof() {
  return (
    <>
      {/* Ticker */}
      <div className="overflow-hidden border-b border-ink/100 bg-ink py-3.5 text-paper">
        <div className="flex w-max animate-swiss-ticker gap-14 whitespace-nowrap font-mono text-[13px] uppercase tracking-[1.5px]">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((it, i) => (
            <span key={i} className="inline-flex items-center gap-4">
              {it}
              <span className="text-brand">●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 border-b border-ink/100 px-6 py-16 sm:grid-cols-4 sm:px-12">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className={`px-6 sm:px-8 ${i < stats.length - 1 ? "border-r border-ink/15" : ""} ${
              i % 2 === 0 ? "border-r border-ink/15 sm:border-r" : ""
            }`}
          >
            <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[1.2px] text-ink/60">
              KPI · 0{i + 1}
            </div>
            <div className="flex items-baseline text-[clamp(56px,8vw,96px)] font-semibold leading-[0.9] tracking-[-0.05em]">
              {s.value}
              {s.sub && <span className="ml-1 text-2xl text-ink/40">{s.sub}</span>}
            </div>
            <div className="mt-3 text-[13px] leading-[1.4] text-ink">{s.label}</div>
          </Reveal>
        ))}
      </section>

      {/* Testimonials */}
      <section className="border-b border-ink/100 px-6 py-24 sm:px-12">
        <div className="mb-14 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <Reveal>
              <div className="font-mono text-[11px] uppercase tracking-[1.4px] text-ink/60">
                [02] · What founders say
              </div>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <Reveal delay={0.06}>
              <h2 className="text-[clamp(48px,7vw,120px)] font-bold leading-[0.9] tracking-[-0.05em]">
                Real systems.
                <br />
                Real <span className="text-brand">ROI</span>.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-6 max-w-xl text-[16px] leading-[1.55] text-ink/80">
                Founders who stopped shipping demos and started shipping systems
                that actually run their business.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-ink/100 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.1}
              className={`group flex min-h-[360px] cursor-default flex-col p-8 transition-colors duration-200 hover:bg-ink hover:text-paper ${
                i < testimonials.length - 1 ? "border-b border-ink/100 md:border-b-0 md:border-r" : ""
              }`}
            >
              <div className="mb-5 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[1.2px] text-ink/60 group-hover:text-paper/60">
                <span>CASE · 0{i + 1}</span>
                <span className="text-brand">★★★★★</span>
              </div>
              <p
                className="flex-1 font-serif text-[26px] font-normal leading-[1.25] tracking-[-0.02em]"
                style={{ textWrap: "pretty" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-7 border-t border-ink/15 pt-5 font-mono text-[12.5px] group-hover:border-paper/15">
                <div className="font-semibold uppercase tracking-[0.8px]">{t.name}</div>
                <div className="mt-1 text-ink/60 group-hover:text-paper/60">{t.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
