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

export type ContactType = "customer" | "vendor" | "partner" | "team" | "lead";

export type TaskStatus = "todo" | "doing" | "done";

export type TaskPriority = "low" | "med" | "high";

export type TaskSource = "human" | "agent";

export type CalendarEventStatus = "confirmed" | "tentative" | "cancelled";

export type NotificationKind =
  | "approval"
  | "lead"
  | "inbox"
  | "agent"
  | "system";

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export type TeamStatus = "active" | "invited";

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
  type: ContactType;
  tags: string[];
  last_contact_at: string | null;
  value_cents: number;
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
  // Optional topic tags used to build the knowledge graph (docs cluster by the
  // topics they share). When absent, the UI derives topics from the title.
  tags?: string[];
}

export interface Task {
  id: string;
  org_id: string;
  title: string;
  detail: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  assignee: string | null;
  source: TaskSource;
  agent_id: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  org_id: string;
  title: string;
  start_at: string;
  end_at: string;
  attendee: string | null;
  channel: string | null;
  status: CalendarEventStatus;
  location: string | null;
  booked_by: string | null;
  created_at: string;
}

export interface Automation {
  id: string;
  org_id: string;
  name: string;
  enabled: boolean;
  trigger: Record<string, unknown>;
  steps: Array<Record<string, unknown>>;
  last_run_at: string | null;
  runs: number;
  created_at: string;
}

export interface AppNotification {
  id: string;
  org_id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  org_id: string;
  email: string;
  name: string | null;
  role: TeamRole;
  status: TeamStatus;
  invited_at: string | null;
  created_at: string;
}

// ---- derived / aggregate shapes -------------------------------------------

export type LeadStageCounts = Record<LeadStage, number>;

export type TaskStatusCounts = Record<TaskStatus, number>;

export type ContactTypeCounts = Record<ContactType, number>;

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
