// Claude API client wrapper for the demo agent. Uses fetch against the Anthropic
// Messages API so it adds ZERO new dependencies (the official @anthropic-ai/sdk is
// not in package.json, see the README for the optional swap).
// Framework-agnostic. No 'next' import.
//
// Reads ANTHROPIC_API_KEY (required at deploy time, never hardcoded) and
// ANTHROPIC_MODEL (optional, defaults below).

import type { AgentStructuredOutput, ChatMessage } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

// Default to a sensible Claude id. Override with ANTHROPIC_MODEL (e.g. claude-opus-4-8).
const DEFAULT_MODEL = "claude-opus-4-8";

const MAX_TOKENS = 1024;

export class AgentClientError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AgentClientError";
    this.status = status;
  }
}

export function getModel(): string {
  const m =
    typeof process !== "undefined" ? process.env.ANTHROPIC_MODEL : undefined;
  return m?.trim() || DEFAULT_MODEL;
}

function getApiKey(): string {
  const key =
    typeof process !== "undefined" ? process.env.ANTHROPIC_API_KEY : undefined;
  if (!key || !key.trim()) {
    throw new AgentClientError(
      "ANTHROPIC_API_KEY is not set. This is a deploy-time secret, set it in the environment.",
      500
    );
  }
  return key.trim();
}

// Anthropic message content shape (text blocks only, which is all we use).
type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
};

// Calls Claude with a system prompt and the running message history, and returns
// the parsed structured output. Throws AgentClientError on transport/parse failure
// so the caller can route to a safe handoff.
export async function callClaude(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<AgentStructuredOutput> {
  const apiKey = getApiKey();
  const model = getModel();

  const body = {
    model,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new AgentClientError(
      `Network error calling Anthropic: ${(err as Error).message}`
    );
  }

  if (!res.ok) {
    const text = await safeText(res);
    throw new AgentClientError(
      `Anthropic API error ${res.status}: ${text}`,
      res.status
    );
  }

  const json = (await res.json()) as AnthropicResponse;
  const raw = (json.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("")
    .trim();

  if (!raw) {
    throw new AgentClientError("Empty response from Anthropic.");
  }

  return parseStructuredOutput(raw);
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}

// Parses the model's JSON reply into AgentStructuredOutput, tolerating stray
// prose or code fences by extracting the first {...} block. Normalizes every
// field so downstream guardrails get well-typed values.
export function parseStructuredOutput(raw: string): AgentStructuredOutput {
  const jsonText = extractJson(raw);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonText) as Record<string, unknown>;
  } catch {
    // If the model failed the contract, treat the whole thing as a low-confidence
    // reply so guardrails route it to a handoff instead of crashing.
    return {
      reply: raw,
      confidence: 0,
      needsHandoff: true,
      handoffReason: "unparseable_model_output",
      extracted: { intent: null, businessType: null, need: null },
      wantsToBook: false,
    };
  }

  const extractedRaw = (parsed.extracted ?? {}) as Record<string, unknown>;

  return {
    reply: asString(parsed.reply),
    confidence: asNumber(parsed.confidence),
    needsHandoff: Boolean(parsed.needsHandoff),
    handoffReason: asString(parsed.handoffReason),
    extracted: {
      intent: asNullableString(extractedRaw.intent),
      businessType: asNullableString(extractedRaw.businessType),
      need: asNullableString(extractedRaw.need),
    },
    wantsToBook: Boolean(parsed.wantsToBook),
  };
}

function extractJson(raw: string): string {
  // Strip code fences if present.
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1);
  }
  return candidate.trim();
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNullableString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function asNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  // Clamp to 0..1.
  return Math.max(0, Math.min(1, n));
}
