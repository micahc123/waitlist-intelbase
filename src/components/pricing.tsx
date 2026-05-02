"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

const CAL_URL = "https://cal.com/intelbase/discovery-call";
const WA_URL = "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

const includes = [
  "Full scoping & architecture",
  "Setup, integration, deployment",
  "Your stack, your accounts",
  "Hand-off + walk-through",
  "Post-launch support window",
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-ink/100 px-6 py-24 sm:px-12">
      <div className="mb-14 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[1.4px] text-ink/60"
          >
            [04] · Pricing
          </motion.div>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="text-[clamp(40px,5.6vw,96px)] font-bold leading-[0.95] tracking-[-0.04em]"
          >
            Every business is different.
            <br />
            So is every <span className="text-brand">quote</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mt-6 max-w-2xl text-[17px] leading-[1.55] text-ink/80"
          >
            We don&apos;t sell shrink-wrapped packages. We scope to your stack, your team,
            your data, and your goals — then send a flat quote before any work starts.
          </motion.p>
        </div>
      </div>

      {/* Invoice card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="border border-ink"
      >
        {/* Invoice header */}
        <div className="grid grid-cols-3 border-b border-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60 sm:px-7">
          <span>QUOTE / INV-2026-0XXX</span>
          <span className="text-center">
            STATUS · <span className="text-brand">OPEN</span>
          </span>
          <span className="text-right">PREPARED FOR · YOU</span>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 border-b border-ink lg:grid-cols-[1.4fr_1fr]">
          <div className="border-b border-ink p-8 sm:p-10 lg:border-b-0 lg:border-r">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60">
              Custom quote
            </div>
            <div className="text-[clamp(80px,12vw,200px)] font-bold leading-[0.85] tracking-[-0.05em]">
              Custom<span className="text-brand">.</span>
            </div>
            <div className="mt-3 font-mono text-[13.5px] text-ink/60">
              ~$500 – $8,000 USD · flat · pre-quoted
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-[1.55] text-ink/80">
              We quote what you actually need. Most projects land between $500 and
              $8k, depending on scope.
            </p>
          </div>
          <div className="p-8 sm:p-10">
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[1.2px] text-ink/60">
              Line items · Included
            </div>
            <table className="w-full border-collapse text-[13.5px]">
              <tbody>
                {includes.map((it, i) => (
                  <tr
                    key={it}
                    className={`${i === 0 ? "border-t border-ink" : ""} border-b border-ink`}
                  >
                    <td className="w-10 py-3 font-mono text-ink/60">0{i + 1}</td>
                    <td className="py-3">{it}</td>
                    <td className="py-3 text-right font-mono text-brand">✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7">
          <div className="font-mono text-[11.5px] uppercase tracking-[1px] text-ink/60">
            30-minute discovery call · No sales pressure · Quote within 24 hours
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 bg-brand px-6 py-4 font-mono text-[12.5px] font-semibold uppercase tracking-[1.2px] text-ink transition-opacity hover:opacity-90"
            >
              Get my free quote →
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 border border-ink px-5 py-4 font-mono text-[12.5px] uppercase tracking-[1.2px] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp →
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
