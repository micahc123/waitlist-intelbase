"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

const CAL_URL = "https://cal.com/intelbase/discovery-call";
const WA_URL = "https://wa.me/85290123551";

const bullets = ["No pressure", "24hr quote", "You own everything"];

export function Hero() {
  return (
    <section
      id="about"
      className="relative flex min-h-[calc(100svh-100px)] flex-col border-b border-ink/100 px-6 pb-12 pt-10 sm:px-12 sm:pb-16 sm:pt-12"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Left brief column */}
        <div className="col-span-12 lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="font-mono text-[11px] uppercase tracking-[1.4px] text-ink/60"
          >
            [01] · The Brief
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-[19px] leading-[1.45] tracking-[-0.01em] text-ink sm:text-[21px]"
          >
            We are a small studio that ships AI systems for operators. Not chatbots.
            Not demos. Production infrastructure that runs your business while you sleep.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="mt-7 grid grid-cols-2 gap-3 border-t border-ink pt-4"
          >
            {bullets.map((b) => (
              <div key={b} className="font-mono text-[11px] text-brand">
                ✓ {b.toUpperCase()}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right H1 column */}
        <div className="col-span-12 lg:col-span-9">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="text-[clamp(64px,9.6vw,184px)] font-bold leading-[0.86] tracking-[-0.055em] text-ink"
          >
            Automate
            <br />
            your entire
            <br />
            <span className="inline-block bg-ink px-[0.18em] leading-[0.95] text-paper">
              business<span className="text-brand">.</span>
            </span>
          </motion.h1>
        </div>
      </div>

      {/* Bottom row pinned to viewport bottom */}
      <div className="mt-auto grid grid-cols-12 gap-6 pt-12">
        <div className="col-span-12 lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[18px] leading-[1.4] text-ink"
            style={{ textWrap: "pretty" }}
          >
            Production-grade AI that actually runs your business. n8n workflows,
            custom agents, RAG over your data — built and shipped end-to-end.
          </motion.p>
        </div>

        <div className="col-span-12 flex flex-col items-start gap-3 lg:col-span-5 lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="flex flex-wrap gap-2.5"
          >
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-3 bg-ink px-7 py-4 font-mono text-[12.5px] uppercase tracking-[1.2px] text-paper transition-opacity hover:opacity-90"
            >
              <span className="inline-block h-2 w-2 bg-brand" /> Get my free quote →
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex cursor-pointer items-center gap-2 border border-ink bg-transparent px-5 py-4 font-mono text-[12.5px] uppercase tracking-[1.2px] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp →
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-mono text-[11px] text-ink/60"
          >
            SLA · 24h quote · avg reply 47min
          </motion.div>
        </div>
      </div>
    </section>
  );
}
