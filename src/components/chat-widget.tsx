"use client";

// AGENT-01, AGENT-05: The live website chat widget (the dogfood demo). A floating
// launcher plus a chat panel, styled to the existing design system tokens
// (globals.css: --blue, --ink, --radius, --shadow, etc.). Talks to /api/agent.
// Clearly labelled as an AI assistant.
//
// Self-contained: it carries its own scoped styles in a <style> block using the
// site's CSS variables, so it matches the brand without touching globals.css.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackLead, trackConciergeAbandoned } from "@/lib/meta-pixel";

type Role = "user" | "assistant";
type UiMessage = { role: Role; content: string };

type BookingAction = {
  label: string;
  url: string;
  reason: "qualified" | "handoff";
};

type AgentApiResponse = {
  conversationId: string;
  reply: string;
  handoff: boolean;
  booking: BookingAction | null;
  confidence: number;
};

const GREETING: UiMessage = {
  role: "assistant",
  content:
    "Hi, I am the intelbase OS concierge, the same AI that would run on your site. Ask me anything about the OS, or tell me what your business needs and I can book you a call.",
};

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingAction | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // GROW-01 retargeting hook state. Tracked in refs so the page-hide listener
  // reads the latest values without re-subscribing on every turn.
  // engagedTurns: how many messages the visitor sent (engagement signal).
  // booked: true once they clicked the booking CTA (excludes them from retargeting).
  // fired: guard so we fire ConciergeAbandoned at most once per page load.
  const engagedTurnsRef = useRef(0);
  const bookedRef = useRef(false);
  const abandonFiredRef = useRef(false);

  // Keep the transcript scrolled to the latest turn.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: UiMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    // Count this as an engagement turn for the retargeting hook.
    engagedTurnsRef.current += 1;

    // Only send real conversation turns to the API (drop the canned greeting).
    const apiMessages = nextMessages.filter(
      (m) => !(m === GREETING || m.content === GREETING.content)
    );

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: apiMessages,
        }),
      });
      const data = (await res.json()) as AgentApiResponse;

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.booking) setBooking(data.booking);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Something went wrong on my end. The best next step is a quick call, want me to set that up?",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not reach the server just now. Try again, or book a call and the team will pick it up.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function onBook() {
    if (!booking) return;
    trackLead();
    // Booked: exclude this visitor from the abandonment retargeting audience.
    bookedRef.current = true;
    if (typeof window !== "undefined") {
      window.open(booking.url, "_blank", "noopener,noreferrer");
    }
  }

  // GROW-01: fire ConciergeAbandoned once when a visitor who engaged the
  // concierge leaves (tab hidden / page unload) without booking. Resilient: the
  // pixel helper no-ops if fbq is absent, so this never breaks the chat.
  useEffect(() => {
    function maybeFireAbandon() {
      if (abandonFiredRef.current) return;
      if (bookedRef.current) return;
      if (engagedTurnsRef.current < 1) return;
      abandonFiredRef.current = true;
      trackConciergeAbandoned(engagedTurnsRef.current);
    }

    function onVisibility() {
      // visibilitychange to "hidden" is the most reliable "leaving" signal across
      // browsers (covers tab switch, navigation, and mobile background).
      if (document.visibilityState === "hidden") maybeFireAbandon();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", maybeFireAbandon);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", maybeFireAbandon);
    };
  }, []);

  // Hide the chat bubble on the /os demo route so it does not appear in recordings.
  if (pathname?.startsWith("/os")) return null;

  return (
    <>
      <style>{WIDGET_CSS}</style>

      {!open && (
        <button
          className="ib-chat-launcher"
          onClick={() => setOpen(true)}
          aria-label="Open the intelbase OS AI assistant"
          type="button"
        >
          <span className="ib-chat-launcher-dot" />
          <span className="ib-chat-launcher-label">Ask the OS</span>
        </button>
      )}

      {open && (
        <div className="ib-chat-panel" role="dialog" aria-label="intelbase OS AI assistant">
          <div className="ib-chat-head">
            <div className="ib-chat-head-id">
              <span className="ib-chat-avatar">io</span>
              <div className="ib-chat-head-text">
                <div className="ib-chat-title">intelbase OS concierge</div>
                <div className="ib-chat-badge">
                  <span className="ib-chat-live" /> AI assistant · live demo
                </div>
              </div>
            </div>
            <button
              className="ib-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              type="button"
            >
              ×
            </button>
          </div>

          <div className="ib-chat-scroll" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  "ib-chat-msg " +
                  (m.role === "user" ? "ib-chat-msg-user" : "ib-chat-msg-bot")
                }
              >
                {m.content}
              </div>
            ))}

            {sending && (
              <div className="ib-chat-msg ib-chat-msg-bot ib-chat-typing">
                <span className="ib-dot" />
                <span className="ib-dot" />
                <span className="ib-dot" />
              </div>
            )}

            {booking && (
              <button className="ib-chat-book" onClick={onBook} type="button">
                {booking.label} <span className="ib-arr">→</span>
              </button>
            )}
          </div>

          <div className="ib-chat-input-row">
            <textarea
              className="ib-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tell me about your business..."
              rows={1}
              aria-label="Message the AI assistant"
            />
            <button
              className="ib-chat-send"
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              type="button"
            >
              <span className="ib-arr">↑</span>
            </button>
          </div>

          <div className="ib-chat-foot">
            Autonomous, with guardrails. It will book a call rather than guess.
          </div>
        </div>
      )}
    </>
  );
}

// Scoped styles. Uses the site's CSS variables so it tracks the brand. Prefixed
// `ib-chat-` to avoid collisions with globals.css.
const WIDGET_CSS = `
.ib-chat-launcher {
  position: fixed; right: 22px; bottom: 22px; z-index: 60;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 20px; border: none; cursor: pointer;
  border-radius: var(--radius-pill, 999px);
  background: var(--blue, #1A7BD9); color: #fff;
  font-family: var(--font-jakarta), system-ui, sans-serif;
  font-weight: 700; font-size: 15px;
  box-shadow: var(--shadow-blue, 0 14px 40px -14px rgba(26,123,217,0.45));
  transition: transform .15s ease, background .15s ease;
}
.ib-chat-launcher:hover { transform: translateY(-1px); background: var(--blue-deep, #0E3F75); }
.ib-chat-launcher-dot {
  width: 9px; height: 9px; border-radius: 999px; background: #7CF2B0;
  box-shadow: 0 0 0 0 rgba(124,242,176,0.7); animation: ib-pulse 1.8s infinite;
}
@keyframes ib-pulse {
  0% { box-shadow: 0 0 0 0 rgba(124,242,176,0.7); }
  70% { box-shadow: 0 0 0 8px rgba(124,242,176,0); }
  100% { box-shadow: 0 0 0 0 rgba(124,242,176,0); }
}

.ib-chat-panel {
  position: fixed; right: 22px; bottom: 22px; z-index: 60;
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 44px));
  display: flex; flex-direction: column;
  background: var(--bg, #fff); color: var(--ink, #0E1B2E);
  border: 1px solid var(--rule, rgba(14,27,46,0.08));
  border-radius: var(--radius-lg, 22px);
  box-shadow: var(--shadow-lg, 0 30px 60px -30px rgba(14,27,46,0.20));
  overflow: hidden;
  font-family: var(--font-jakarta), system-ui, sans-serif;
}

.ib-chat-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid var(--rule, rgba(14,27,46,0.08));
  background: var(--bg-soft, #F7F9FC);
}
.ib-chat-head-id { display: flex; align-items: center; gap: 10px; }
.ib-chat-avatar {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
  background: var(--blue, #1A7BD9); color: #fff;
  font-weight: 800; font-size: 13px; letter-spacing: .5px;
}
.ib-chat-title { font-weight: 700; font-size: 15px; line-height: 1.2; }
.ib-chat-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--body, #4B5970); margin-top: 2px;
}
.ib-chat-live {
  width: 7px; height: 7px; border-radius: 999px; background: var(--green, #16A34A);
}
.ib-chat-close {
  border: none; background: transparent; cursor: pointer;
  font-size: 24px; line-height: 1; color: var(--body, #4B5970);
  width: 32px; height: 32px; border-radius: 8px;
}
.ib-chat-close:hover { background: var(--bg-mute, #F1F4F9); color: var(--ink, #0E1B2E); }

.ib-chat-scroll {
  flex: 1; overflow-y: auto; padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.ib-chat-msg {
  max-width: 84%; padding: 10px 13px; font-size: 14px; line-height: 1.5;
  border-radius: 14px; white-space: pre-wrap; word-wrap: break-word;
}
.ib-chat-msg-bot {
  align-self: flex-start; background: var(--bg-mute, #F1F4F9);
  color: var(--ink, #0E1B2E); border-bottom-left-radius: 4px;
}
.ib-chat-msg-user {
  align-self: flex-end; background: var(--blue, #1A7BD9);
  color: #fff; border-bottom-right-radius: 4px;
}
.ib-chat-typing { display: inline-flex; gap: 4px; align-items: center; }
.ib-dot {
  width: 6px; height: 6px; border-radius: 999px; background: var(--body, #4B5970);
  opacity: .5; animation: ib-blink 1.2s infinite;
}
.ib-dot:nth-child(2) { animation-delay: .2s; }
.ib-dot:nth-child(3) { animation-delay: .4s; }
@keyframes ib-blink { 0%,100% { opacity: .25; } 50% { opacity: .9; } }

.ib-chat-book {
  align-self: flex-start; margin-top: 2px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 18px; border: none; cursor: pointer;
  border-radius: var(--radius-pill, 999px);
  background: var(--blue, #1A7BD9); color: #fff; font-weight: 700; font-size: 14px;
}
.ib-chat-book:hover { background: var(--blue-deep, #0E3F75); }

.ib-chat-input-row {
  display: flex; align-items: flex-end; gap: 8px; padding: 12px;
  border-top: 1px solid var(--rule, rgba(14,27,46,0.08));
}
.ib-chat-input {
  flex: 1; resize: none; max-height: 120px;
  padding: 11px 13px; font-size: 14px; line-height: 1.4;
  border: 1px solid var(--rule, rgba(14,27,46,0.08));
  border-radius: 12px; background: var(--bg, #fff); color: var(--ink, #0E1B2E);
  font-family: inherit; outline: none;
}
.ib-chat-input:focus { border-color: var(--blue, #1A7BD9); }
.ib-chat-send {
  width: 40px; height: 40px; flex: none; border: none; cursor: pointer;
  border-radius: 12px; background: var(--blue, #1A7BD9); color: #fff;
  font-size: 18px; display: grid; place-items: center;
}
.ib-chat-send:disabled { opacity: .4; cursor: not-allowed; }
.ib-chat-send:not(:disabled):hover { background: var(--blue-deep, #0E3F75); }

.ib-chat-foot {
  padding: 8px 14px 12px; text-align: center;
  font-size: 11px; color: var(--body, #4B5970);
}
.ib-arr { display: inline-block; }
`;
