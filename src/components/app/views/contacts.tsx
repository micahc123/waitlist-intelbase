// Contacts - the relationship directory. A dense .ibx-table of everyone the
// business deals with (customers, vendors, partners, team, leads), with a search
// box, type-count pills in the header, and a per-type filter. Clicking a row
// opens a right detail drawer with the contact's fields and a recent-activity
// placeholder. Reads from /api/app/contacts, which serves deterministic DEMO
// data when Supabase is unconfigured so the directory populates with no keys.

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Contact2,
  Search,
  X,
  Mail,
  Phone,
  Building2,
  Tag,
  Clock,
} from "lucide-react";
import { ViewHead } from "./view-shell";
import type { Contact, ContactType, ContactTypeCounts } from "@/lib/db/types";
import "./contacts.css";

const TYPES: ContactType[] = ["customer", "vendor", "partner", "team", "lead"];

const TYPE_CHIP: Record<ContactType, string> = {
  customer: "ibx-chip-success",
  vendor: "ibx-chip-info",
  partner: "is-partner",
  team: "is-team",
  lead: "ibx-chip-warning",
};

function hkd(cents: number): string {
  if (!cents) return "--";
  return `HK$${Math.round(cents / 100).toLocaleString("en-HK")}`;
}

function relative(iso: string | null): string {
  if (!iso) return "--";
  const diff = Date.now() - new Date(iso).getTime();
  const hr = Math.round(diff / 3600000);
  if (hr < 1) return "just now";
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [counts, setCounts] = useState<ContactTypeCounts | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/app/contacts")
      .then((r) => r.json())
      .then((data: { contacts: Contact[]; counts: ContactTypeCounts }) => {
        if (!active) return;
        setContacts(data.contacts ?? []);
        setCounts(data.counts ?? null);
      })
      .catch(() => {
        if (active) setContacts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const liveCounts = useMemo<ContactTypeCounts>(() => {
    const base: ContactTypeCounts = {
      customer: 0,
      vendor: 0,
      partner: 0,
      team: 0,
      lead: 0,
    };
    (contacts ?? []).forEach((c) => {
      if (TYPES.includes(c.type)) base[c.type] += 1;
    });
    return contacts ? base : (counts ?? base);
  }, [contacts, counts]);

  const visible = useMemo(() => {
    let rows = [...(contacts ?? [])];
    if (typeFilter !== "all") rows = rows.filter((c) => c.type === typeFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return rows;
  }, [contacts, query, typeFilter]);

  const selected = useMemo(
    () => (contacts ?? []).find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId],
  );

  return (
    <div className="ibx contacts">
      <ViewHead
        title="Contacts"
        subtitle="Everyone your business deals with - customers, vendors, partners, your team - in one directory."
      />

      <div className="contacts-pills">
        <button
          type="button"
          className={`contacts-pill${typeFilter === "all" ? " is-active" : ""}`}
          onClick={() => setTypeFilter("all")}
          aria-pressed={typeFilter === "all"}
        >
          <span className="contacts-pill-label">All</span>
          <span className="contacts-pill-value">
            {contacts === null ? "--" : (contacts?.length ?? 0)}
          </span>
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            className={`contacts-pill is-${t}${typeFilter === t ? " is-active" : ""}`}
            onClick={() => setTypeFilter((f) => (f === t ? "all" : t))}
            aria-pressed={typeFilter === t}
          >
            <span className="contacts-pill-label">{t}</span>
            <span className="contacts-pill-value">
              {contacts === null ? "--" : liveCounts[t]}
            </span>
          </button>
        ))}
      </div>

      <div className="ibx-panel">
        <div className="contacts-toolbar">
          <div className="contacts-search">
            <Search size={15} />
            <input
              className="ibx-input"
              type="search"
              placeholder="Search name, company, email, tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search contacts"
            />
          </div>
          {contacts !== null && (
            <span className="contacts-result-count">
              {visible.length} of {contacts.length}
            </span>
          )}
        </div>

        <div className="contacts-table-wrap">
          <table className="ibx-table contacts-table">
            <thead>
              <tr>
                <th scope="col">Contact</th>
                <th scope="col">Type</th>
                <th scope="col">Channel</th>
                <th scope="col">Tags</th>
                <th scope="col">Last contact</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts === null &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} aria-hidden="true">
                    <td colSpan={6}>
                      <div className="contacts-skel" />
                    </td>
                  </tr>
                ))}

              {contacts !== null &&
                visible.map((c) => (
                  <tr
                    key={c.id}
                    className={`contacts-row${selectedId === c.id ? " is-selected" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${c.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(c.id);
                      }
                    }}
                  >
                    <td>
                      <div className="contacts-name">{c.name}</div>
                      <div className="contacts-company">{c.company ?? "--"}</div>
                    </td>
                    <td>
                      <span className={`ibx-chip ${TYPE_CHIP[c.type]}`}>
                        <span className="ibx-chip-dot" />
                        {c.type}
                      </span>
                    </td>
                    <td className="contacts-channel">{c.channel ?? "--"}</td>
                    <td>
                      <div className="contacts-tags">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="contacts-tag">
                            {t}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="contacts-tag is-more">
                            +{c.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="contacts-last">{relative(c.last_contact_at)}</td>
                    <td className="ibx-td-num">{hkd(c.value_cents)}</td>
                  </tr>
                ))}

              {contacts !== null && visible.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="ibx-empty">
                      <div className="ibx-empty-icon">
                        <Contact2 size={22} />
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                        {contacts.length === 0
                          ? "No contacts yet"
                          : "No contacts match your filters"}
                      </div>
                      <div style={{ maxWidth: "38ch" }}>
                        {contacts.length === 0
                          ? "People you talk to are saved here automatically as conversations and deals happen."
                          : "Try a different search or clear the type filter."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ContactDrawer contact={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function ContactDrawer({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="contacts-drawer-scrim" onClick={onClose}>
      <aside
        className="contacts-drawer"
        role="dialog"
        aria-label={`${contact.name} details`}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="contacts-drawer-head">
          <div>
            <div className="contacts-drawer-name">{contact.name}</div>
            <div className="contacts-drawer-company">
              {contact.company ?? "Independent"}
            </div>
          </div>
          <button
            type="button"
            className="ibx-btn ibx-btn-ghost"
            onClick={onClose}
            aria-label="Close"
            style={{ width: 36, padding: 0, justifyContent: "center" }}
          >
            <X size={16} />
          </button>
        </header>

        <div className="contacts-drawer-body">
          <span className={`ibx-chip ${TYPE_CHIP[contact.type]}`}>
            <span className="ibx-chip-dot" />
            {contact.type}
          </span>

          <dl className="contacts-fields">
            <Field icon={<Mail size={14} />} label="Email" value={contact.email} />
            <Field icon={<Phone size={14} />} label="Phone" value={contact.phone} />
            <Field
              icon={<Building2 size={14} />}
              label="Company"
              value={contact.company}
            />
            <Field
              icon={<Clock size={14} />}
              label="Last contact"
              value={relative(contact.last_contact_at)}
            />
            <Field
              icon={<Tag size={14} />}
              label="Lifetime value"
              value={hkd(contact.value_cents)}
            />
          </dl>

          {contact.tags.length > 0 && (
            <div className="contacts-drawer-tags">
              <div className="contacts-section-label">Tags</div>
              <div className="contacts-tags">
                {contact.tags.map((t) => (
                  <span key={t} className="contacts-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="contacts-section-label">Recent activity</div>
          <div className="contacts-activity-empty">
            Conversation history, bookings, and deal updates for this contact will
            stream here as your agents work.
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="contacts-field">
      <dt className="contacts-field-label">
        <span className="contacts-field-icon">{icon}</span>
        {label}
      </dt>
      <dd className="contacts-field-value">{value ?? "--"}</dd>
    </div>
  );
}
