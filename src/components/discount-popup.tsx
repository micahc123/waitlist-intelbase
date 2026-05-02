"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const WA_LINK =
  "https://wa.me/85290123551?text=" +
  encodeURIComponent("Hi, I'd like to claim my 10% discount on my first build!");

export function DiscountPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("discount-dismissed")) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem("discount-dismissed", "1");
  }

  function claim() {
    localStorage.setItem("discount-dismissed", "1");
    window.open(WA_LINK, "_blank");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="fixed top-20 right-4 z-50 w-[320px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#18191c]/95 shadow-[0_8px_48px_rgba(0,0,0,0.7)] backdrop-blur-md"
        >
          {/* Notification header bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-400" />
              <span className="text-[10.5px] font-semibold uppercase tracking-widest text-neutral-500">Intelbase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-600">now</span>
              <button
                onClick={dismiss}
                className="rounded p-0.5 text-neutral-600 transition-colors hover:text-neutral-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Message body */}
          <div className="p-4">
            <p className="mb-0.5 text-[13.5px] font-semibold text-white">🎉 Limited offer — 10% off</p>
            <p className="text-[12.5px] leading-relaxed text-neutral-400">
              Claim 10% off your first build. Tap below and we&apos;ll lock it in for you over WhatsApp.
            </p>

            <button
              onClick={claim}
              className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Claim via WhatsApp
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
