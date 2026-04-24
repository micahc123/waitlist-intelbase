"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";

const guarantees = [
  "No pressure",
  "24hr quote",
  "You own everything",
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-28">
      {/* Aurora glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 translate-y-[25%]">
        <div className="absolute inset-0 rounded-[50%] bg-blue-600/25 blur-[80px]" />
        <div className="absolute inset-x-[10%] inset-y-[5%] rounded-[50%] bg-indigo-500/20 blur-[60px]" />
        <div className="absolute inset-x-[25%] inset-y-[15%] rounded-[50%] bg-violet-500/15 blur-[50px]" />
      </div>
      {/* Side glows */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/[0.05] blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 top-1/2 h-[350px] w-[350px] rounded-full bg-blue-500/[0.04] blur-[80px]" />

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#08090a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#08090a] to-transparent" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Scarcity pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[13px] text-neutral-300 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-neutral-200">We take a limited number of clients per month</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-[clamp(2.5rem,6.5vw,4.5rem)] font-medium leading-[1.05] tracking-[-0.025em] text-white"
        >
          Automate your{" "}
          <span className="font-semibold">entire business.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-lg text-[18px] leading-relaxed text-neutral-300"
        >
          Production-grade AI that actually runs your business.
          OpenClaw, n8n workflows, custom agents — built and shipped end-to-end.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <a
            href="https://cal.com/intelbase/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg bg-white px-8 py-4 text-[16px] font-semibold text-black shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all hover:bg-neutral-100 hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.45)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Book a Free Discovery Call
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="/work"
            className="text-[14px] text-neutral-400 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            or see recent work →
          </a>
        </motion.div>

        {/* Guarantees row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {guarantees.map((g) => (
            <div
              key={g}
              className="flex items-center gap-1.5 text-[14px] text-neutral-300"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400/80" />
              {g}
            </div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="flex items-center -space-x-2.5">
            {[
              { bg: "from-blue-400 to-indigo-500", initials: "EH" },
              { bg: "from-amber-400 to-orange-500", initials: "TC" },
              { bg: "from-emerald-400 to-teal-500", initials: "TJ" },
              { bg: "from-violet-400 to-purple-500", initials: "TL" },
              { bg: "from-rose-400 to-pink-500", initials: "MR" },
            ].map((person, i) => (
              <div
                key={person.initials}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#08090a] bg-gradient-to-br ${person.bg} text-[10px] font-bold text-white shadow-lg`}
                style={{ zIndex: 5 - i }}
              >
                {person.initials}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 9.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <p className="text-[14.5px] text-neutral-400">
              <span className="font-semibold text-white">50+ businesses</span> automated · 4.9/5 rating
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
