"use client";

// Real streaming chat with a single Intelbase agent.
//
// Talks to POST /api/agents/<agentId>/chat, which returns an AI SDK UI message
// stream (toUIMessageStreamResponse) when the runtime is online, OR a plain-text
// body (the canned OFFLINE_REPLY) when ANTHROPIC_API_KEY is missing.
//
// RESILIENCE: DefaultChatTransport expects a UI message stream. To handle the
// offline plain-text response gracefully we pass a custom `fetch` that detects a
// non-event-stream response and rewrites it into a minimal, valid UI message
// stream (start / text-start / text-delta / text-end / finish). That way the
// offline reply renders as a normal assistant message and nothing crashes.
//
// API verified against node_modules:
//   @ai-sdk/react v3.0.199 -> useChat({ transport }) returns
//     { messages, sendMessage, status, error, ... }
//   ai v6.0.197 -> DefaultChatTransport, ChatStatus = submitted|streaming|ready|error
//   sendMessage({ text }); messages[].parts[] where text parts are { type:"text", text }

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion } from "motion/react";
import * as Lucide from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { NodeKind } from "@/lib/command/types";
import "./agent-chat.css";

// --------------------------------------------------------------------------
// Node label -> agent runtime id mapping.
//
// Agent runtime ids (src/lib/agents/agents.ts):
//   concierge, inbox, scheduler, leadgen, nurture, ops
// We map a clicked node by keyword in its label, defaulting to "ops".
// --------------------------------------------------------------------------

export type AgentId =
  | "concierge"
  | "inbox"
  | "scheduler"
  | "leadgen"
  | "nurture"
  | "ops";

export function mapNodeToAgentId(label: string, kind?: NodeKind): AgentId {
  const l = (label || "").toLowerCase();
  if (l.includes("concierge")) return "concierge";
  if (l.includes("inbox")) return "inbox";
  if (l.includes("schedul")) return "scheduler";
  if (l.includes("lead")) return "leadgen";
  if (l.includes("nurture")) return "nurture";
  if (l.includes("ad engine") || l.includes("outreach") || l.includes("ad ")) {
    return "ops";
  }
  // The core node and anything unrecognised route to the general operator.
  void kind;
  return "ops";
}

// --------------------------------------------------------------------------
// Custom fetch: tolerate the offline plain-text reply.
//
// If the response is not a UI message event-stream (e.g. text/plain offline
// reply, or a JSON error) we synthesize a tiny UI message stream so the chat
// renders the text as an assistant message instead of throwing.
// --------------------------------------------------------------------------

function sse(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`);
}

function textToUiMessageStream(text: string): Response {
  const id = `offline-${Date.now()}`;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(sse({ type: "start" }));
      controller.enqueue(sse({ type: "text-start", id }));
      controller.enqueue(sse({ type: "text-delta", id, delta: text }));
      controller.enqueue(sse({ type: "text-end", id }));
      controller.enqueue(sse({ type: "finish" }));
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
}

const resilientFetch: typeof fetch = async (input, init) => {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    return textToUiMessageStream(
      "I could not reach the agent runtime just now. Please try again in a moment.",
    );
  }

  const ct = res.headers.get("content-type") || "";

  // Real UI message stream: pass through untouched.
  if (ct.includes("text/event-stream")) return res;

  // Anything else (plain-text offline reply, or a JSON error) -> read the body
  // and present it as a graceful assistant message.
  let body = "";
  try {
    body = await res.text();
  } catch {
    body = "";
  }

  let display = body.trim();
  if (ct.includes("application/json")) {
    try {
      const parsed = JSON.parse(body) as { error?: string };
      display = parsed?.error || display;
    } catch {
      /* keep raw body */
    }
  }
  if (!display) {
    display =
      "The agent is in demo mode right now. Connect the runtime to get live replies.";
  }
  return textToUiMessageStream(display);
};

// --------------------------------------------------------------------------
// Message rendering helpers
// --------------------------------------------------------------------------

type MessageLike = {
  id?: string;
  role: string;
  parts?: Array<{ type: string; text?: string }>;
};

function messageText(m: MessageLike): string {
  if (!Array.isArray(m.parts)) return "";
  return m.parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join("");
}

// --------------------------------------------------------------------------
// AgentChat panel
// --------------------------------------------------------------------------

export function AgentChat({
  agentId,
  agentLabel,
  onClose,
}: {
  agentId: AgentId;
  agentLabel: string;
  onClose?: () => void;
}) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/agents/${agentId}/chat`,
        fetch: resilientFetch,
      }),
    [agentId],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const busy = status === "submitted" || status === "streaming";

  // Autoscroll to newest content as it streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus the composer when the panel opens.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    // sendMessage is fire-and-forget; any transport error surfaces via `error`
    // and the resilient fetch already turns offline/error bodies into messages.
    void sendMessage({ text });
  }, [input, busy, sendMessage]);

  const onFormSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      submit();
    },
    [submit],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends; Shift+Enter inserts a newline.
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return (
    <motion.div
      className="agc"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="agc-head">
        <button
          type="button"
          className="agc-back"
          aria-label="Back to agent details"
          onClick={onClose}
        >
          <Lucide.ChevronLeft size={16} strokeWidth={2} />
        </button>
        <span className="agc-avatar">
          <Lucide.Sparkles size={16} strokeWidth={1.9} />
        </span>
        <div className="agc-id">
          <div className="agc-name">{agentLabel}</div>
          <div className="agc-meta">
            <span className="agc-dot" />
            {isOnlineHint(status, error)}
          </div>
        </div>
      </header>

      <div className="agc-stream" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="agc-empty">
            <Lucide.MessageSquareDashed size={26} strokeWidth={1.4} />
            <p>Talk to {agentLabel}. Ask it to do something real.</p>
            <span className="agc-empty-hint">
              Enter to send, Shift + Enter for a new line.
            </span>
          </div>
        )}

        {messages.map((m) => {
          const text = messageText(m as MessageLike);
          const mine = m.role === "user";
          if (!text && !mine) return null;
          return (
            <div
              key={m.id}
              className={`agc-msg ${mine ? "agc-msg--user" : "agc-msg--agent"}`}
            >
              <div className="agc-bubble">{text}</div>
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="agc-msg agc-msg--agent">
            <div className="agc-bubble agc-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <form className="agc-compose" onSubmit={onFormSubmit}>
        <textarea
          ref={inputRef}
          className="agc-input"
          rows={1}
          value={input}
          placeholder={`Message ${agentLabel}...`}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={false}
        />
        <button
          type="submit"
          className="agc-send"
          aria-label="Send message"
          disabled={!input.trim() || busy}
        >
          {busy ? (
            <Lucide.Loader2 size={16} strokeWidth={2.2} className="agc-spin" />
          ) : (
            <Lucide.ArrowUp size={16} strokeWidth={2.4} />
          )}
        </button>
      </form>
    </motion.div>
  );
}

// Subtle live/demo hint. We do not know server config from the client, so we
// describe the connection state. When the runtime is offline the reply still
// arrives (via the resilient fetch) and reads as a normal message.
function isOnlineHint(status: string, error: unknown): string {
  if (error) return "reconnecting";
  if (status === "streaming") return "responding";
  if (status === "submitted") return "thinking";
  return "live agent";
}
