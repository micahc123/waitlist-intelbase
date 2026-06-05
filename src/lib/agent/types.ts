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

// Where a lead came in from. "web" is the default dogfood chat widget.
// Added for the multi-channel lead systems (WhatsApp concierge, try-it demo,
// readiness audit). Optional + defaulted everywhere so existing records that
// predate this field stay valid (backward compatible).
export type LeadChannel = "web" | "whatsapp";

// The lead-magnet/source that produced a lead, for attribution in the dashboard.
// "concierge" is the live chat (web or whatsapp). The others are the new tools.
export type LeadSource = "concierge" | "try-it" | "audit";

// Optional contact info captured by the lead-magnet tools (try-it, audit). The
// concierge chat does not collect these directly; they stay undefined there.
export type LeadContact = {
  name?: string;
  email?: string;
  business?: string;
  // For WhatsApp leads: the visitor's phone number (wa_id).
  phone?: string;
  // For the try-it demo: the website URL the prospect submitted.
  website?: string;
};

// A persisted lead record (one per conversation).
export type LeadRecord = {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  qualification: LeadQualification;
  // Full transcript so the dashboard can show the captured loop.
  messages: ChatMessage[];
  // Channel the lead arrived on. Optional for backward compatibility; treat a
  // missing value as "web".
  channel?: LeadChannel;
  // Which tool/source produced the lead. Optional; missing means "concierge".
  source?: LeadSource;
  // Contact details captured by the lead-magnet tools. Optional.
  contact?: LeadContact;
};

// Aggregate metrics the dashboard reads.
export type LeadMetrics = {
  conversations: number;
  qualified: number;
  booked: number;
};
