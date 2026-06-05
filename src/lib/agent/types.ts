// Framework-agnostic shared types for the intelbase OS demo agent.
// No imports from 'next'. Safe to use in both server routes and lib code.

export type Role = "user" | "assistant";

export type ChatMessage = {
  role: Role;
  content: string;
};

// What the qualification state machine extracts across a conversation.
export type LeadQualification = {
  // Why the visitor is here (e.g. "lose leads overnight", "want more booked calls").
  intent: string | null;
  // Kind of business (e.g. "DTC skincare", "B2B SaaS", "local services").
  businessType: string | null;
  // The specific pain/need they want solved.
  need: string | null;
  // True once intent + businessType + need are all captured.
  qualified: boolean;
  // True once the agent has surfaced a booking action and the visitor signalled intent to book.
  booked: boolean;
};

// Structured fields the model fills on every turn. Drives guardrails + qualification.
// The model returns this as JSON; see client.ts / route handler for parsing.
export type AgentStructuredOutput = {
  // The visible reply shown to the visitor.
  reply: string;
  // 0..1 self-reported confidence that the reply is accurate and on-script.
  confidence: number;
  // True when the model judges it should hand off to a human / book a call
  // instead of answering (out of scope, asked for an exact price, etc.).
  needsHandoff: boolean;
  // Short machine reason for the handoff, for logging. Empty when not handing off.
  handoffReason: string;
  // Incremental qualification signal extracted from THIS turn. Nulls mean "no new info".
  extracted: {
    intent: string | null;
    businessType: string | null;
    need: string | null;
  };
  // The model's judgement that the visitor wants to book now.
  wantsToBook: boolean;
};

// The full agent turn result returned by runAgentTurn().
export type AgentTurnResult = {
  reply: string;
  qualification: LeadQualification;
  handoff: boolean;
  // Present when qualified or handing off: the booking action to surface.
  booking: BookingAction | null;
  confidence: number;
};

export type BookingAction = {
  label: string;
  url: string;
  // Why we're surfacing it now: "qualified" once the visitor is qualified,
  // "handoff" when the agent is escaping to a human.
  reason: "qualified" | "handoff";
};

// A persisted lead record (one per conversation).
export type LeadRecord = {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  qualification: LeadQualification;
  // Full transcript so the dashboard can show the captured loop.
  messages: ChatMessage[];
};

// Aggregate metrics the dashboard reads.
export type LeadMetrics = {
  conversations: number;
  qualified: number;
  booked: number;
};
