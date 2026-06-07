// Inbox - the unified front-office inbox. Two-pane shared inbox: a conversation
// list on the left (channel + status + unread emphasis) and the selected thread
// on the right (messages + composer). Fetches the list on mount and the full
// thread on select from /api/app/conversations, which serves deterministic DEMO
// data when Supabase is unconfigured so the inbox populates with no keys.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Inbox as InboxIcon, Send, Sparkles } from "lucide-react";
import { ViewHead } from "./view-shell";
import type {
  Conversation,
  ConversationChannel,
  ConversationStatus,
  ConversationStatusCounts,
  ConversationWithMessages,
  Message,
} from "@/lib/db/types";
import "./inbox.css";

const CHANNEL_LABEL: Record<ConversationChannel, string> = {
  web: "Web",
  email: "Email",
  whatsapp: "WhatsApp",
  ig: "IG",
};

const STATUS_CHIP: Record<ConversationStatus, string> = {
  open: "ibx-chip-info",
  waiting: "ibx-chip-warning",
  closed: "ibx-chip",
};

const ROLE_LABEL: Record<Message["role"], string> = {
  visitor: "Visitor",
  agent: "AI agent",
  human: "You",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  return `${day}d`;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChannelChip({ channel }: { channel: ConversationChannel }) {
  return (
    <span className={`inbox-ch inbox-ch-${channel}`}>
      {CHANNEL_LABEL[channel]}
    </span>
  );
}

function StatusChip({ status }: { status: ConversationStatus }) {
  return (
    <span className={`ibx-chip ${STATUS_CHIP[status]}`}>
      <span className="ibx-chip-dot" />
      {status}
    </span>
  );
}

// "Unread" is a believable demo signal: open threads whose last message is from
// the visitor (i.e. waiting on us) read as unread / needs-attention.
function isUnread(c: Conversation): boolean {
  return c.status === "open";
}

export function Inbox() {
  const [list, setList] = useState<Conversation[] | null>(null);
  const [counts, setCounts] = useState<ConversationStatusCounts | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationWithMessages | null>(null);
  // The conversation id the current fetch has settled on (success or failure).
  // Loading is derived from this, so we never setState synchronously in effects.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const streamRef = useRef<HTMLDivElement>(null);

  const threadLoading = selectedId !== null && selectedId !== loadedId;

  // Fetch the conversation list on mount; auto-select the first thread.
  useEffect(() => {
    let active = true;
    fetch("/api/app/conversations")
      .then((r) => r.json())
      .then((data: { conversations: Conversation[]; counts: ConversationStatusCounts }) => {
        if (!active) return;
        setList(data.conversations ?? []);
        setCounts(data.counts ?? null);
        if (data.conversations?.length) setSelectedId(data.conversations[0].id);
      })
      .catch(() => {
        if (active) setList([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Fetch the full thread whenever the selection changes. The derived
  // `threadLoading` covers the in-flight window (selectedId set, thread not yet
  // matching), so we only ever setState in the async callback.
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    fetch(`/api/app/conversations?id=${encodeURIComponent(selectedId)}`)
      .then((r) => r.json())
      .then((data: { conversation?: ConversationWithMessages }) => {
        if (!active) return;
        setThread(data.conversation ?? null);
        setLoadedId(selectedId);
      })
      .catch(() => {
        if (!active) return;
        setThread(null);
        setLoadedId(selectedId);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  // Keep the message stream pinned to the latest message.
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [thread]);

  const onSend = useCallback(() => {
    // Non-functional send (demo): clear the draft. A real send would POST here.
    setDraft("");
  }, []);

  return (
    <div className="ibx">
      <ViewHead
        title="Inbox"
        subtitle="Every conversation your business is having, in one place."
      />

      <div className="inbox-shell">
        {/* LEFT: list */}
        <section className="ibx-panel inbox-list" aria-label="Conversations">
          <header className="inbox-list-head">
            <span className="inbox-list-title">Conversations</span>
            <div className="inbox-count-group">
              <span className="ibx-chip ibx-chip-info" title="Open">
                {counts ? counts.open : "--"} open
              </span>
              <span className="ibx-chip ibx-chip-warning" title="Waiting">
                {counts ? counts.waiting : "--"} waiting
              </span>
            </div>
          </header>

          <div className="inbox-list-scroll">
            {list === null && <ListSkeleton />}

            {list !== null && list.length === 0 && (
              <div className="ibx-empty">
                <div className="ibx-empty-icon">
                  <InboxIcon size={22} />
                </div>
                <div style={{ fontWeight: 600, color: "var(--ib-text-2)" }}>
                  No conversations yet
                </div>
                <div style={{ maxWidth: "32ch" }}>
                  When someone messages you on web chat, email, WhatsApp, or IG,
                  the thread shows up here.
                </div>
              </div>
            )}

            {list?.map((c) => {
              const unread = isUnread(c);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`inbox-row${unread ? " is-unread" : ""}`}
                  aria-current={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="inbox-row-top">
                    {unread && <span className="inbox-unread-dot" aria-label="unread" />}
                    <span className="inbox-row-name">{c.contact_name ?? "Unknown"}</span>
                    <span className="inbox-row-time ibx-num">
                      {relativeTime(c.last_at)}
                    </span>
                  </div>
                  <div className="inbox-row-snippet">
                    <ChannelChip channel={c.channel} />
                    <span className="inbox-row-subject">
                      {c.subject ?? "(no subject)"}
                    </span>
                    <StatusChip status={c.status} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* RIGHT: thread */}
        <section className="ibx-panel inbox-thread" aria-label="Conversation thread">
          {!selectedId && (
            <div className="inbox-center ibx-empty">
              <div className="ibx-empty-icon">
                <InboxIcon size={22} />
              </div>
              <div style={{ maxWidth: "30ch" }}>
                Select a conversation to read the thread and reply.
              </div>
            </div>
          )}

          {selectedId && threadLoading && <ThreadSkeleton />}

          {selectedId && !threadLoading && !thread && (
            <div className="inbox-center ibx-empty">
              <div className="ibx-empty-icon">
                <InboxIcon size={22} />
              </div>
              <div style={{ maxWidth: "30ch" }}>
                This conversation could not be loaded.
              </div>
            </div>
          )}

          {selectedId && !threadLoading && thread && (
            <>
              <header className="inbox-thread-head">
                <div className="inbox-thread-id">
                  <ChannelChip channel={thread.channel} />
                  <div style={{ minWidth: 0 }}>
                    <div className="inbox-thread-name">
                      {thread.contact_name ?? "Unknown"}
                    </div>
                    <div className="inbox-thread-sub">
                      {thread.subject ?? "(no subject)"}
                    </div>
                  </div>
                </div>
                <StatusChip status={thread.status} />
              </header>

              <div className="inbox-stream" ref={streamRef}>
                {thread.messages.map((m) => (
                  <article key={m.id} className={`inbox-msg from-${m.role}`}>
                    <div className="inbox-msg-meta">
                      {m.role === "agent" && <Sparkles size={11} />}
                      {ROLE_LABEL[m.role]}
                    </div>
                    <div className="inbox-bubble">{m.body}</div>
                    <div className="inbox-msg-time ibx-num">
                      {timeLabel(m.created_at)}
                    </div>
                  </article>
                ))}
              </div>

              <div className="inbox-composer">
                <div className="inbox-draft-note">
                  <Sparkles size={12} />
                  The AI drafted a reply you can edit before sending.
                </div>
                <div className="inbox-composer-row">
                  <textarea
                    className="ibx-input"
                    placeholder="Write a reply..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={1}
                    aria-label="Reply"
                  />
                  <button
                    type="button"
                    className="ibx-btn ibx-btn-primary"
                    onClick={onSend}
                    disabled={!draft.trim()}
                  >
                    <Send size={15} />
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "var(--ib-3) var(--ib-4)",
            borderBottom: "1px solid var(--ib-hairline)",
          }}
        >
          <div
            className="inbox-skel"
            style={{ width: "55%", marginBottom: "10px" }}
          />
          <div className="inbox-skel" style={{ width: "80%" }} />
        </div>
      ))}
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div
      className="inbox-stream"
      aria-hidden="true"
      style={{ justifyContent: "flex-start" }}
    >
      {[60, 75, 50, 70].map((w, i) => (
        <div
          key={i}
          className={`inbox-msg ${i % 2 ? "from-agent" : "from-visitor"}`}
          style={{ width: `${w}%`, maxWidth: `${w}%` }}
        >
          <div
            className="inbox-skel"
            style={{ height: "44px", width: "100%", borderRadius: "var(--ib-r-md)" }}
          />
        </div>
      ))}
    </div>
  );
}
