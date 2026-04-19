"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MessageCircle, Globe } from "lucide-react";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Showcase", href: "/showcase" },
      { label: "Courses", href: "/courses", hidden: true },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <footer ref={ref} className="relative z-10 px-6 pb-8 pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-12 grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-white"
              >
                <rect width="20" height="20" rx="5" fill="currentColor" fillOpacity="0.15" />
                <rect x="4" y="4" width="5" height="5" rx="1.5" fill="currentColor" />
                <rect x="11" y="4" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity="0.4" />
                <rect x="4" y="11" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity="0.4" />
                <rect x="11" y="11" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity="0.2" />
              </svg>
              <span className="text-sm font-medium text-white">Intelbase</span>
            </div>
            <p className="mb-5 max-w-xs text-[13px] leading-relaxed text-neutral-500">
              Fully automate your entire business. Production-ready AI
              infrastructure and done-for-you services — from OpenClaw setups
              to n8n workflow automation.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/85290123551"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-neutral-500 transition-colors hover:text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Message us on WhatsApp
              </a>
              <a
                href="https://intelbase.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-neutral-500 transition-colors hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                intelbase.co
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-600">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.filter((l) => !l.hidden).map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-neutral-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 sm:flex-row">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} Intelbase. All rights reserved.
          </p>
          <p className="text-xs text-neutral-700">
            Built with precision.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
