"use client";

import Image from "next/image";
import { trackLead } from "@/lib/meta-pixel";

export function Footer({ onQuote }: { onQuote: () => void }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="foot-brand">
          <div className="name">
            <span className="brand-mark" style={{ width: 40, height: 40 }}>
              <Image
                src="/intelbase-logo.png"
                alt=""
                width={80}
                height={80}
                style={{ width: 40, height: 40 }}
              />
            </span>
            Intelbase
          </div>
          <div className="desc">
            intelbase OS runs your front office autonomously. It answers every
            visitor, qualifies every lead, books your calls, and runs your ads,
            with guardrails, on one dashboard.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                trackLead();
                onQuote();
              }}
            >
              Get a quote <span className="arr">→</span>
            </button>
          </div>
        </div>
        <div className="foot-col">
          <h6>The OS</h6>
          <ul>
            <li>
              <a href="#services">AI Website Concierge</a>
            </li>
            <li>
              <a href="#services">Autonomous Lead Generation</a>
            </li>
            <li>
              <a href="#services">Lead Nurture on Autopilot</a>
            </li>
            <li>
              <a href="#services">AI Ad Engine</a>
            </li>
            <li>
              <a href="#services">One Control Dashboard</a>
            </li>
          </ul>
        </div>
        <div className="foot-col">
          <h6>Studio</h6>
          <ul>
            <li>
              <a href="#process">Process</a>
            </li>
            <li>
              <a href="#work">Results</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="/audit">AI Readiness Audit</a>
            </li>
          </ul>
        </div>
        <div className="foot-col">
          <h6>Contact</h6>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onQuote();
                }}
              >
                Book a call
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/85290123551"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:intelbase952@gmail.com">intelbase952@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">
        <div>© {new Date().getFullYear()} Intelbase Studio. All rights reserved.</div>
        <div className="online">
          <span className="dot" /> Accepting briefs · 6 spots open
        </div>
      </div>
    </footer>
  );
}
