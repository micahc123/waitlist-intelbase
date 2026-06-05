// AGENT-02: Lightweight qualification state machine. Captures intent, business
// type, and need across a conversation and decides when a visitor is "qualified".
// Framework-agnostic. No 'next' import.
//
// The model does the extraction (it returns `extracted` each turn). This module
// is the deterministic state container: it merges new signals, never loses a
// captured field, and computes the qualified/booked flags by fixed rules so the
// definition of "qualified" lives in code, not in the model's head.

import type { AgentStructuredOutput, LeadQualification } from "./types";

export function emptyQualification(): LeadQualification {
  return {
    intent: null,
    businessType: null,
    need: null,
    qualified: false,
    booked: false,
  };
}

// A field is "captured" once set. We only overwrite a null with a value, so the
// model cannot accidentally erase something it already learned.
function mergeField(current: string | null, incoming: string | null): string | null {
  const clean = incoming?.trim();
  if (current) return current;
  if (clean) return clean;
  return null;
}

// Qualified = we know why they are here, what kind of business, and their need.
export function isQualified(q: LeadQualification): boolean {
  return Boolean(q.intent && q.businessType && q.need);
}

// Folds one model turn into the running qualification state.
export function applyTurn(
  prev: LeadQualification,
  output: AgentStructuredOutput
): LeadQualification {
  const ex = output.extracted ?? {
    intent: null,
    businessType: null,
    need: null,
  };

  const next: LeadQualification = {
    intent: mergeField(prev.intent, ex.intent),
    businessType: mergeField(prev.businessType, ex.businessType),
    need: mergeField(prev.need, ex.need),
    qualified: prev.qualified,
    // booked latches true once set, plus this turn's signal.
    booked: prev.booked || Boolean(output.wantsToBook),
  };

  next.qualified = isQualified(next);
  return next;
}

// Human-readable summary of what is still missing, useful for logs/debug.
export function missingFields(q: LeadQualification): string[] {
  const missing: string[] = [];
  if (!q.intent) missing.push("intent");
  if (!q.businessType) missing.push("businessType");
  if (!q.need) missing.push("need");
  return missing;
}
