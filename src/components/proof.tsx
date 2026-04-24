"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const stats = [
  { value: "50+", label: "Automated" },
  { value: "24 hrs", label: "Quote" },
  { value: "4.9/5", label: "Rating" },
  { value: "Limited", label: "Spots/Month" },
];

const testimonials = [
  {
    quote:
      "Paid for itself in six weeks. Replaced three SaaS tools and a VA.",
    name: "Marcus Webb",
    role: "Head of Ops, Arcline",
    bg: "from-blue-400 to-indigo-500",
    initials: "MW",
  },
  {
    quote:
      "Live the day after our call. Cold email replies doubled the next week.",
    name: "Sarah Chen",
    role: "Founder, Luminary",
    bg: "from-amber-400 to-orange-500",
    initials: "SC",
  },
  {
    quote:
      "Wasted six months on a custom build. They shipped our RAG in 72 hours.",
    name: "David Park",
    role: "CTO, Helix Labs",
    bg: "from-emerald-400 to-teal-500",
    initials: "DP",
  },
];

export function Proof() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative px-6 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-6xl">
        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[#0e0f12] px-5 py-8 text-center"
            >
              <div className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 text-[13px] uppercase tracking-wider text-neutral-500">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            What founders say
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            Real systems. <span className="text-neutral-400">Real ROI.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-400">
            Founders who stopped shipping demos and started shipping systems that
            actually run their business.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#111214] p-6 transition-colors hover:border-white/[0.15]"
            >
              <div>
                <div className="mb-3 flex text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <svg
                      key={idx}
                      className="h-3.5 w-3.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 9.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[15.5px] leading-relaxed text-neutral-200">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.bg} text-[11px] font-bold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white">
                    {t.name}
                  </div>
                  <div className="text-[12px] text-neutral-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
