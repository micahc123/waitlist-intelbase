"use client";

import { useEffect, useState } from "react";

type QuoteModalProps = {
  open: boolean;
  onClose: () => void;
};

export function QuoteModal({ open, onClose }: QuoteModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    scope: "Business Automation",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
      setErrors({});
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = "That email looks off";
    if (!form.notes.trim()) errs.notes = "Tell us a little about your project";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setSubmitted(true);
  };

  return (
    <div
      className={"modal-backdrop" + (open ? " open" : "")}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {!submitted && (
          <>
            <div className="modal-head">
              <div>
                <span className="modal-eyebrow">Free quote · 24h</span>
                <div className="modal-title">
                  Tell us <span className="accent">what to build.</span>
                </div>
                <div className="modal-sub">
                  30-min call. Flat quote in 24 hours. No sales pressure.
                </div>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                ×
              </button>
            </div>
            <form className="form" onSubmit={submit} noValidate>
              <div className="form-row">
                <div className={"field" + (errors.name ? " err" : "")}>
                  <label>Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Jane Founder"
                  />
                  {errors.name && <div className="errmsg">{errors.name}</div>}
                </div>
                <div className={"field" + (errors.email ? " err" : "")}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="jane@company.com"
                  />
                  {errors.email && <div className="errmsg">{errors.email}</div>}
                </div>
              </div>
              <div className="field">
                <label>Company</label>
                <input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="field">
                <label>What to build</label>
                <select
                  value={form.scope}
                  onChange={(e) => set("scope", e.target.value)}
                >
                  <option>OpenClaw Full Setup</option>
                  <option>Business Automation</option>
                  <option>Social Media & AI Ads</option>
                  <option>n8n Workflow Automation</option>
                  <option>Custom LLM & RAG</option>
                  <option>Custom AI Solutions</option>
                  <option>Claude Systems & MCP</option>
                </select>
              </div>
              <div className={"field" + (errors.notes ? " err" : "")}>
                <label>What problem are you solving?</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Lead routing eats 6 hrs a week. We need…"
                />
                {errors.notes && <div className="errmsg">{errors.notes}</div>}
              </div>
              <div className="form-foot">
                <div className="note">24h flat quote · avg reply 47 min</div>
                <button type="submit" className="btn btn-primary">
                  Send brief <span className="arr">→</span>
                </button>
              </div>
            </form>
          </>
        )}
        {submitted && (
          <div className="success">
            <div className="check-big">✓</div>
            <h3>Brief received.</h3>
            <p>
              We&apos;ll send a flat quote within 24 hours — usually faster. Check your inbox.
            </p>
            <div style={{ marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
