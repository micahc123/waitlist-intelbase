"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Zap, Palette, BarChart3, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Days, Not Months",
    body: "Concept to launch at a pace that redefines fast. Because waiting isn\u2019t a strategy.",
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    body: "Every detail considered. Every element refined. Design so precise, it feels inevitable.",
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    body: "Layouts informed by data. Decisions backed by performance. Results you can measure.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    body: "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.",
  },
];

export function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative px-6 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-6">
            Why Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]">
            The difference is everything.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="liquid-glass rounded-2xl p-6"
              >
                <div className="liquid-glass-strong rounded-full w-10 h-10 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-medium text-white font-body mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 font-body font-light text-sm leading-relaxed">
                  {feature.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
