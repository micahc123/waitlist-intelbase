"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { trackLead, trackContact } from "@/lib/meta-pixel";

const CAL_URL = "https://cal.com/intelbase/discovery-call";
const WA_URL =
  "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

const bullets = ["No pressure", "24hr quote", "You own everything"];

export function Hero() {
  return (
    <section
      id="about"
      className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 border-b border-ink/100 px-6 pb-14 pt-12 text-center sm:gap-12 sm:px-12 sm:pb-20 sm:pt-16"
    >
      {/* Brief: stacked last */}
      <div className="order-4 mx-auto w-full max-w-[640px]">
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
          className="mt-5 text-[18px] leading-[1.45] tracking-[-0.01em] text-ink sm:text-[20px]"
        >
          We are a small studio that builds AI systems for businesses that want
          to automate. Not chatbots. Not demos. Production infrastructure that
          runs your business while you sleep.
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

      {/* H1 */}
      <div className="order-1">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="text-[clamp(56px,9.2vw,128px)] font-bold leading-[0.88] tracking-[-0.05em] text-ink"
        >
          Automate
          <br />
          your entire
          <br />
          <span className="mt-3 inline-block translate-y-2 bg-ink px-[0.18em] leading-[0.95] text-paper">
            business<span className="text-brand">.</span>
          </span>
        </motion.h1>
      </div>

      {/* Subcopy */}
      <div className="order-2">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-[640px] text-[17px] leading-[1.5] text-ink sm:text-[19px]"
          style={{ textWrap: "pretty" }}
        >
          Production-grade AI that actually runs your business. n8n workflows,
          custom agents, RAG over your data — built and shipped end-to-end.
        </motion.p>
      </div>

      {/* CTAs */}
      <div className="order-3 mx-auto flex w-full max-w-[760px] flex-col items-stretch gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="flex w-full max-w-[760px] flex-col gap-3 sm:flex-row"
        >
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackLead}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-3 bg-brand px-10 py-7 font-mono text-[16px] uppercase tracking-[1.2px] text-paper shadow-[0_6px_0_0_var(--ink)] transition-transform hover:-translate-y-0.5 sm:text-[17px]"
          >
            <span className="inline-block h-2.5 w-2.5 bg-ink" /> Get my free quote →
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackContact}
            className="inline-flex cursor-pointer items-center justify-center gap-2.5 border border-ink bg-transparent px-8 py-7 font-mono text-[15px] uppercase tracking-[1.2px] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            <MessageCircle className="h-4 w-4" />
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
    </section>
  );
}
