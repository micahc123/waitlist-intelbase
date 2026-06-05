"use client";

// DASH-01, DASH-02: The control dashboard. Reads REAL captured data from
// /api/leads (never hardcoded) and shows the autonomous loop: conversations,
// qualified leads, booked calls, plus per-conversation detail. Sensible empty
// state when no data has been captured yet.
//
// Self-contained scoped styles using the site's CSS variables (globals.css), so
// it matches the brand without editing globals.css.

import { useEffect, useState } from "react";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

type LeadQualification = {
  intent: string | null;
  businessType: string | null;
  need: string | null;
  qualified: boolean;
  booked: boolean;
};

type LeadRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  qualification: LeadQualification;
  messages: ChatMessage[];
};

type LeadMetrics = {
  conversations: number;
  qualified: number;
  booked: number;
};

type LeadsResponse = {
  metrics: LeadMetrics;
  leads: LeadRecord[];
  error?: string;
};

export function DashboardView() {
  const [data, setData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/leads", { cache: "no-store" });
        const json = (await res.json()) as LeadsResponse;
        if (cancelled) return;
        if (json.error) setError(json.error);
        setData(json);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = data?.metrics ?? {
    conversations: 0,
    qualified: 0,
    booked: 0,
  };
  const leads = data?.leads ?? [];

  return (
    <div className="ib-dash">
      <style>{DASH_CSS}</style>

      <header className="ib-dash-head">
        <div>
          <div className="ib-dash-eyebrow">
            <span className="ib-dash-live" /> Live · the dogfood loop
          </div>
          <h1 className="ib-dash-title">intelbase OS dashboard</h1>
          <p className="ib-dash-sub">
            The autonomous loop on this site, captured in real time. Conversations
            the OS handled, leads it qualified, calls it moved to book.
          </p>
        </div>
        <a className="ib-dash-home" href="/">
          ← Back to site
        </a>
      </header>

      <section className="ib-dash-cards">
        <Stat label="Conversations" value={metrics.conversations} hint="Visitors the OS answered" />
        <Stat label="Qualified leads" value={metrics.qualified} hint="Intent, business, and need captured" />
        <Stat label="Calls moving to book" value={metrics.booked} hint="Visitors who chose to book" />
      </section>

      {loading && <div className="ib-dash-note">Loading captured data...</div>}

      {error && !loading && (
        <div className="ib-dash-error">
          Could not load leads: {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="ib-dash-empty">
          <div className="ib-dash-empty-mark">○</div>
          <h2>No conversations yet</h2>
          <p>
            The moment a visitor talks to the concierge on this site, the
            conversation, the qualification, and any booking show up here. Open
            the chat in the corner and try it.
          </p>
        </div>
      )}

      {!loading && leads.length > 0 && (
        <section className="ib-dash-list">
          <div className="ib-dash-list-head">
            <span>Conversation</span>
            <span>Business</span>
            <span>Need</span>
            <span>Status</span>
            <span>Updated</span>
          </div>

          {leads.map((lead) => {
            const isOpen = openId === lead.id;
            return (
              <div key={lead.id} className="ib-dash-row-wrap">
                <button
                  className="ib-dash-row"
                  onClick={() => setOpenId(isOpen ? null : lead.id)}
                  type="button"
                >
                  <span className="ib-dash-cell ib-dash-mono">
                    {shortId(lead.id)}
                  </span>
                  <span className="ib-dash-cell">
                    {lead.qualification.businessType || "—"}
                  </span>
                  <span className="ib-dash-cell ib-dash-truncate">
                    {lead.qualification.need || "—"}
                  </span>
                  <span className="ib-dash-cell">
                    <StatusBadge q={lead.qualification} />
                  </span>
                  <span className="ib-dash-cell ib-dash-muted">
                    {formatTime(lead.updatedAt)}
                  </span>
                </button>

                {isOpen && (
                  <div className="ib-dash-detail">
                    <div className="ib-dash-detail-meta">
                      <Meta label="Intent" value={lead.qualification.intent} />
                      <Meta label="Business" value={lead.qualification.businessType} />
                      <Meta label="Need" value={lead.qualification.need} />
                    </div>
                    <div className="ib-dash-transcript">
                      {lead.messages.map((m, i) => (
                        <div
                          key={i}
                          className={
                            "ib-dash-bubble " +
                            (m.role === "user"
                              ? "ib-dash-bubble-user"
                              : "ib-dash-bubble-bot")
                          }
                        >
                          <span className="ib-dash-bubble-role">
                            {m.role === "user" ? "Visitor" : "OS"}
                          </span>
                          {m.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="ib-dash-card">
      <div className="ib-dash-card-val">{value}</div>
      <div className="ib-dash-card-label">{label}</div>
      <div className="ib-dash-card-hint">{hint}</div>
    </div>
  );
}

function StatusBadge({ q }: { q: LeadQualification }) {
  if (q.booked)
    return <span className="ib-dash-badge ib-dash-badge-book">Booking</span>;
  if (q.qualified)
    return <span className="ib-dash-badge ib-dash-badge-qual">Qualified</span>;
  return <span className="ib-dash-badge ib-dash-badge-open">In progress</span>;
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="ib-dash-metacell">
      <div className="ib-dash-metalabel">{label}</div>
      <div className="ib-dash-metaval">{value || "Not captured yet"}</div>
    </div>
  );
}

function shortId(id: string): string {
  return id.length > 10 ? id.slice(0, 8) : id;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const DASH_CSS = `
.ib-dash {
  max-width: 1100px; margin: 0 auto; padding: 48px var(--pad-x, 24px) 80px;
  font-family: var(--font-jakarta), system-ui, sans-serif;
  color: var(--ink, #0E1B2E);
}
.ib-dash-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 24px; flex-wrap: wrap; margin-bottom: 32px;
}
.ib-dash-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--blue, #1A7BD9);
  margin-bottom: 10px;
}
.ib-dash-live {
  width: 8px; height: 8px; border-radius: 999px; background: var(--green, #16A34A);
}
.ib-dash-title { font-size: 34px; font-weight: 800; line-height: 1.1; margin: 0 0 8px; }
.ib-dash-sub { font-size: 15px; color: var(--body, #4B5970); max-width: 560px; margin: 0; }
.ib-dash-home {
  font-size: 14px; font-weight: 600; color: var(--body, #4B5970); text-decoration: none;
  padding: 10px 16px; border: 1px solid var(--rule, rgba(14,27,46,0.08));
  border-radius: var(--radius-pill, 999px); white-space: nowrap;
}
.ib-dash-home:hover { color: var(--ink, #0E1B2E); border-color: var(--ink, #0E1B2E); }

.ib-dash-cards {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px;
}
@media (max-width: 640px) { .ib-dash-cards { grid-template-columns: 1fr; } }
.ib-dash-card {
  padding: 22px; border: 1px solid var(--rule, rgba(14,27,46,0.08));
  border-radius: var(--radius, 14px); background: var(--bg, #fff);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(14,27,46,0.04));
}
.ib-dash-card-val { font-size: 40px; font-weight: 800; line-height: 1; color: var(--blue-deep, #0E3F75); }
.ib-dash-card-label { font-size: 15px; font-weight: 700; margin-top: 10px; }
.ib-dash-card-hint { font-size: 13px; color: var(--body, #4B5970); margin-top: 4px; }

.ib-dash-note { font-size: 14px; color: var(--body, #4B5970); padding: 24px 0; }
.ib-dash-error {
  padding: 16px 18px; border-radius: var(--radius, 14px);
  background: #FEF2F2; color: #B91C1C; font-size: 14px;
  border: 1px solid #FECACA;
}
.ib-dash-empty {
  text-align: center; padding: 64px 24px;
  border: 1px dashed var(--rule-2, rgba(14,27,46,0.14));
  border-radius: var(--radius-lg, 22px); background: var(--bg-soft, #F7F9FC);
}
.ib-dash-empty-mark { font-size: 40px; color: var(--blue, #1A7BD9); opacity: .5; }
.ib-dash-empty h2 { font-size: 20px; margin: 12px 0 8px; }
.ib-dash-empty p { font-size: 14px; color: var(--body, #4B5970); max-width: 420px; margin: 0 auto; }

.ib-dash-list {
  border: 1px solid var(--rule, rgba(14,27,46,0.08));
  border-radius: var(--radius, 14px); overflow: hidden; background: var(--bg, #fff);
}
.ib-dash-list-head, .ib-dash-row {
  display: grid; grid-template-columns: 130px 1fr 1.4fr 120px 130px;
  gap: 12px; align-items: center;
}
.ib-dash-list-head {
  padding: 12px 18px; font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; color: var(--body, #4B5970);
  background: var(--bg-soft, #F7F9FC);
  border-bottom: 1px solid var(--rule, rgba(14,27,46,0.08));
}
.ib-dash-row {
  width: 100%; text-align: left; padding: 14px 18px; cursor: pointer;
  border: none; background: transparent; font-family: inherit; font-size: 14px;
  border-bottom: 1px solid var(--rule, rgba(14,27,46,0.06));
}
.ib-dash-row:hover { background: var(--bg-soft, #F7F9FC); }
.ib-dash-cell { color: var(--ink-2, #1F2D44); overflow: hidden; }
.ib-dash-truncate { white-space: nowrap; text-overflow: ellipsis; }
.ib-dash-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: var(--body); }
.ib-dash-muted { color: var(--body, #4B5970); font-size: 13px; }
@media (max-width: 720px) {
  .ib-dash-list-head { display: none; }
  .ib-dash-row { grid-template-columns: 1fr auto; row-gap: 6px; }
}

.ib-dash-badge {
  display: inline-block; padding: 4px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 700;
}
.ib-dash-badge-open { background: var(--bg-mute, #F1F4F9); color: var(--body, #4B5970); }
.ib-dash-badge-qual { background: var(--blue-tint, #E8F1FB); color: var(--blue-deep, #0E3F75); }
.ib-dash-badge-book { background: #DCFCE7; color: #15803D; }

.ib-dash-detail {
  padding: 18px; background: var(--bg-soft, #F7F9FC);
  border-bottom: 1px solid var(--rule, rgba(14,27,46,0.08));
}
.ib-dash-detail-meta {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;
}
@media (max-width: 640px) { .ib-dash-detail-meta { grid-template-columns: 1fr; } }
.ib-dash-metacell {
  padding: 12px; background: var(--bg, #fff);
  border: 1px solid var(--rule, rgba(14,27,46,0.08)); border-radius: 10px;
}
.ib-dash-metalabel { font-size: 11px; text-transform: uppercase; letter-spacing: .4px; color: var(--body, #4B5970); }
.ib-dash-metaval { font-size: 14px; margin-top: 4px; color: var(--ink, #0E1B2E); }

.ib-dash-transcript { display: flex; flex-direction: column; gap: 8px; }
.ib-dash-bubble {
  max-width: 80%; padding: 9px 12px; font-size: 13px; line-height: 1.5;
  border-radius: 12px;
}
.ib-dash-bubble-role {
  display: block; font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; opacity: .6; margin-bottom: 3px;
}
.ib-dash-bubble-bot { align-self: flex-start; background: var(--bg, #fff); border: 1px solid var(--rule, rgba(14,27,46,0.08)); }
.ib-dash-bubble-user { align-self: flex-end; background: var(--blue, #1A7BD9); color: #fff; }
`;
