// TypeScript interfaces for the AI OS data backbone.
//
// These mirror the tables defined in supabase/app-schema.sql one-to-one. They
// are the shared shape used by both the demo datasets (src/lib/db/demo.ts) and
// the Supabase-backed data modules, so a product surface can render the same
// way whether the data is real or demo.

// ---- enums (string unions, matching the SQL check constraints) -------------

export type LeadStage = "new" | "qualified" | "booked" | "won" | "lost";

export type LeadSource = "Web" | "Ads" | "WhatsApp" | "Referral";

export type ConversationChannel = "web" | "email" | "whatsapp" | "ig";

export type ConversationStatus = "open" | "waiting" | "closed";

export type MessageRole = "visitor" | "agent" | "human";

export type ActionStatus = "pending" | "approved" | "rejected" | "auto";

export type AgentAutonomy = "manual" | "approve" | "auto";

export type KnowledgeStatus = "processing" | "ready" | "failed";

// The six product agents. Used as agent_id values.
export type AgentId =
  | "concierge"
  | "inbox"
  | "scheduler"
  | "leadgen"
  | "nurture"
  | "ops";

// ---- row interfaces --------------------------------------------------------

export interface Contact {
  id: string;
  org_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  channel: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  org_id: string;
  name: string;
  company: string | null;
  value_cents: number;
  stage: LeadStage;
  source: string | null;
  score: number;
  owner: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  org_id: string;
  contact_name: string | null;
  channel: ConversationChannel;
  subject: string | null;
  status: ConversationStatus;
  last_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  body: string;
  created_at: string;
}

// A conversation with its messages attached (returned by getConversation).
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ActionItem {
  id: string;
  org_id: string;
  agent_id: string;
  type: string;
  summary: string;
  detail: Record<string, unknown>;
  status: ActionStatus;
  created_at: string;
  decided_at: string | null;
  decided_by: string | null;
}

export interface AgentConfig {
  id: string;
  org_id: string;
  agent_id: string;
  enabled: boolean;
  autonomy: AgentAutonomy;
  instructions: string | null;
  guardrails: Record<string, unknown>;
  updated_at: string;
}

export interface KnowledgeDoc {
  id: string;
  org_id: string;
  title: string;
  source: string | null;
  status: KnowledgeStatus;
  chunks: number;
  created_at: string;
}

// ---- derived / aggregate shapes -------------------------------------------

export type LeadStageCounts = Record<LeadStage, number>;

export type ConversationStatusCounts = Record<ConversationStatus, number>;

export interface OverviewMetrics {
  leadsThisWeek: number;
  bookings: number;
  responseTimeSeconds: number;
  conversionRate: number; // 0..1
  messagesHandled: number;
  pipelineValueCents: number;
}

// Standard return for write operations so callers never have to catch.
export interface WriteResult {
  ok: boolean;
  reason?: string;
}
