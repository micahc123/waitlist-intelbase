// AGENT-04: Guardrails. The agent must NEVER invent a price or make a promise.
// Two layers:
//   (a) Prompt-level hard rules (see GUARDRAIL_RULES in systemPrompt.ts), and
//   (b) This output-level confidence/escape-hatch check that runs in code on
//       every model turn, so a guardrail breach cannot reach the visitor even if
//       the model ignores the prompt.
// Framework-agnostic. No 'next' import.

import type { AgentStructuredOutput } from "./types";

// Below this confidence we force a handoff regardless of what the model said.
export const CONFIDENCE_THRESHOLD = 0.5;

// Safe fallback shown to the visitor when we suppress a risky reply.
export const HANDOFF_MESSAGE =
  "I want to get this exactly right rather than guess. The best next step is a quick free call where the team scopes it for you and gives real numbers. Want me to set that up?";

// Patterns that should never appear in a reply: exact prices and hard commitments.
// These are a backstop in case the model emits a number despite the prompt rules.
const PRICE_PATTERNS: RegExp[] = [
  // Currency-prefixed amounts: $2,500 / US$15k / HK$5000 / £500 / €1k
  /(?:US\$|HK\$|\$|£|€)\s?\d[\d,.]*\s?(?:k|m)?\b/i,
  // Amount followed by a currency word: 2500 usd / 5k dollars / 500 hkd
  /\b\d[\d,.]*\s?(?:k|m)?\s?(?:usd|hkd|gbp|eur|dollars?|pounds?|euros?)\b/i,
  // "costs 5000" / "price is 2500" style numeric quotes
  /\b(?:costs?|priced?|price\s+is|pay)\s+\d[\d,.]{2,}/i,
];

// Phrases that imply a hard promise/commitment the agent cannot make.
const PROMISE_PATTERNS: RegExp[] = [
  /\bi (?:guarantee|promise)\b/i,
  /\bwe (?:guarantee|promise)\b/i,
  /\bguaranteed (?:results?|roi|return|leads?)\b/i,
  /\b(?:refund|money[\s-]?back)\s+guarantee/i,
];

export type GuardrailDecision = {
  // True if the original reply is safe to show as-is.
  safe: boolean;
  // Whether we must hand off to a human / booking.
  handoff: boolean;
  // The reply to actually show the visitor (original, or HANDOFF_MESSAGE).
  reply: string;
  // The confidence to report downstream.
  confidence: number;
  // Machine-readable reason when not safe.
  reason: string;
};

// Returns true if the text appears to contain an exact price or a hard promise.
export function containsForbiddenContent(text: string): {
  found: boolean;
  reason: string;
} {
  for (const re of PRICE_PATTERNS) {
    if (re.test(text)) return { found: true, reason: "invented_price" };
  }
  for (const re of PROMISE_PATTERNS) {
    if (re.test(text)) return { found: true, reason: "hard_promise" };
  }
  return { found: false, reason: "" };
}

// The single guardrail gate. Run this on the model's structured output BEFORE the
// reply is sent to the visitor. It enforces the escape hatch even when the model
// self-reports high confidence but the text trips a forbidden pattern.
export function applyGuardrails(
  output: AgentStructuredOutput
): GuardrailDecision {
  const forbidden = containsForbiddenContent(output.reply);

  // Hard backstop: forbidden content always forces a handoff and suppresses the reply.
  if (forbidden.found) {
    return {
      safe: false,
      handoff: true,
      reply: HANDOFF_MESSAGE,
      confidence: Math.min(output.confidence, CONFIDENCE_THRESHOLD - 0.01),
      reason: forbidden.reason,
    };
  }

  // Model explicitly asked to hand off (out of scope, unsure).
  if (output.needsHandoff) {
    return {
      safe: false,
      handoff: true,
      // Prefer the model's own reply if it already framed the handoff well,
      // otherwise use the safe fallback.
      reply: output.reply?.trim() ? output.reply : HANDOFF_MESSAGE,
      confidence: output.confidence,
      reason: output.handoffReason || "model_requested_handoff",
    };
  }

  // Low confidence forces a handoff even if the model did not flag it.
  if (
    typeof output.confidence !== "number" ||
    Number.isNaN(output.confidence) ||
    output.confidence < CONFIDENCE_THRESHOLD
  ) {
    return {
      safe: false,
      handoff: true,
      reply: HANDOFF_MESSAGE,
      confidence: Number.isFinite(output.confidence) ? output.confidence : 0,
      reason: "low_confidence",
    };
  }

  // Safe path.
  return {
    safe: true,
    handoff: false,
    reply: output.reply,
    confidence: output.confidence,
    reason: "",
  };
}
