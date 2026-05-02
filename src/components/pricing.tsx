"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";

const inclusions = [
  "Full scoping & architecture",
  "Setup, integration, deployment",
  "Your stack, your accounts",
  "Hand-off + walk-through",
  "Post-launch support window",
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-[50%] bg-blue-600/[0.05] blur-[110px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Pricing
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            Every business is different.
            <br className="hidden sm:block" />
            <span className="text-neutral-400">So is every quote.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-neutral-300">
            We don&apos;t sell shrink-wrapped packages. We scope to your stack,
            your team, your data, and your goals — then send a flat quote
            before any work starts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0f12] p-8 sm:p-10"
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-[280px] w-[280px] rounded-full bg-blue-500/[0.07] blur-[70px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-[240px] w-[240px] rounded-full bg-cyan-600/[0.06] blur-[70px]" />

          <div className="relative grid gap-8 sm:grid-cols-2 sm:gap-10">
            <div>
              <span className="inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                Custom quote
              </span>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-tight text-white">
                  Custom
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-300">
                We quote what you actually need. Most
                projects land between <span className="font-medium text-white">$500 and $8k</span>,
                depending on scope.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
                Every quote includes
              </p>
              <ul className="space-y-2.5">
                {inclusions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[15px] text-neutral-200"
                  >
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-blue-400/80" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-8">
            <a
              href="https://cal.com/intelbase/discovery-call"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-black shadow-[0_0_30px_-5px_rgba(255,255,255,0.25)] transition-all hover:bg-neutral-100"
            >
              Get My Free Quote
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="https://wa.me/85290123551"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-[14px] font-medium text-neutral-200 transition-all hover:bg-white/[0.08]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center text-[13px] text-neutral-500"
        >
          30-minute discovery call · No sales pressure · Quote within 24 hours
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-3 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[12px] text-neutral-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            We take a limited number of clients per month
          </div>
        </motion.div>
      </div>
    </section>
  );
}
