"use client";

import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { trackLead, trackContact } from "@/lib/meta-pixel";

const CAL_URL = "https://cal.com/intelbase/discovery-call";
const WA_URL = "https://wa.me/85290123551?text=Hi%20I%27d%20like%20to%20automate%20my%20business.";

export function CTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-b border-ink/100 bg-ink px-6 py-28 text-paper sm:px-12 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 swiss-diag" />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 font-mono text-[11px] uppercase tracking-[1.4px] text-brand"
        >
          ● We take a limited number of clients per month
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.06 }}
          className="text-[clamp(80px,13vw,240px)] font-bold leading-[0.85] tracking-[-0.06em]"
        >
          Automate.
          <br />
          Ship<span className="text-brand">.</span>
          <br />
          Repeat.
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 items-end gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="max-w-xl text-[19px] leading-[1.5] text-paper/75"
          >
            Book a free 30-min call. We scope the build, send a flat quote within 24 hours,
            and ship it.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="flex flex-wrap gap-2.5 lg:justify-end"
          >
            <a
              href={CAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackLead}
              className="inline-flex cursor-pointer items-center gap-2 bg-brand px-7 py-5 font-mono text-[13.5px] font-semibold uppercase tracking-[1.2px] text-ink transition-opacity hover:opacity-90"
            >
              Get my free quote →
            </a>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackContact}
              className="inline-flex cursor-pointer items-center gap-2 border border-paper px-6 py-5 font-mono text-[13.5px] uppercase tracking-[1.2px] text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp →
            </a>
          </motion.div>
        </div>
        <div className="mt-8 font-mono text-[11.5px] uppercase tracking-[1px] text-paper/60">
          No pressure · Quote in 24 hrs
        </div>
      </div>
    </section>
  );
}
