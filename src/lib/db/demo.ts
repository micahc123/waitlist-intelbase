// Deterministic, realistic demo datasets for the AI OS work surfaces.
//
// These power "demo mode": when Supabase is unconfigured or empty, the product
// reads from here so every surface looks populated and believable. The data is
// for a fictional Hong Kong multi-business owner and is intentionally STABLE
// (no randomness, fixed ids and values) so the demo never wobbles between
// renders and snapshots stay diff-clean.
//
// All timestamps are computed relative to "now" at call time so the demo always
// feels current (e.g. "2 hours ago") without ever showing a future date.

import type {
  ActionItem,
  AgentConfig,
  Conversation,
  ConversationWithMessages,
  KnowledgeDoc,
  Lead,
  Message,
  OverviewMetrics,
} from "./types";

// Fixed org id for all demo rows so relations line up if anything joins them.
const DEMO_ORG = "demo-org";

// Relative-time helpers (kept local so demo.ts has no dependencies).
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

// HK$ amounts are stored in cents to match the schema (value_cents).
function hkd(dollars: number): number {
  return Math.round(dollars * 100);
}

// ===========================================================================
// Leads (~14 across all stages)
// ===========================================================================
export function demoLeads(): Lead[] {
  const rows: Array<Omit<Lead, "org_id">> = [
    {
      id: "lead-001",
      name: "Dr. Amelia Wong",
      company: "Harbour Dental",
      value_cents: hkd(48000),
      stage: "won",
      source: "Referral",
      score: 96,
      owner: "Concierge",
      created_at: ago(21 * DAY),
      updated_at: ago(2 * DAY),
    },
    {
      id: "lead-002",
      name: "Marcus Ho",
      company: "North X Smoke Shop",
      value_cents: hkd(18500),
      stage: "booked",
      source: "Ads",
      score: 88,
      owner: "Leadgen",
      created_at: ago(6 * DAY),
      updated_at: ago(8 * HOUR),
    },
    {
      id: "lead-003",
      name: "Priya Nair",
      company: "Conscious Soul Skin",
      value_cents: hkd(32000),
      stage: "qualified",
      source: "Web",
      score: 81,
      owner: "Concierge",
      created_at: ago(3 * DAY),
      updated_at: ago(5 * HOUR),
    },
    {
      id: "lead-004",
      name: "Kenji Tanaka",
      company: "Kowloon Physio",
      value_cents: hkd(26000),
      stage: "booked",
      source: "WhatsApp",
      score: 84,
      owner: "Scheduler",
      created_at: ago(4 * DAY),
      updated_at: ago(12 * HOUR),
    },
    {
      id: "lead-005",
      name: "Sophie Lam",
      company: "Lamma Yoga Collective",
      value_cents: hkd(14000),
      stage: "new",
      source: "Ads",
      score: 62,
      owner: "Leadgen",
      created_at: ago(9 * HOUR),
      updated_at: ago(9 * HOUR),
    },
    {
      id: "lead-006",
      name: "David Chan",
      company: "Central Tax Advisory",
      value_cents: hkd(72000),
      stage: "qualified",
      source: "Referral",
      score: 91,
      owner: "Concierge",
      created_at: ago(8 * DAY),
      updated_at: ago(1 * DAY),
    },
    {
      id: "lead-007",
      name: "Grace Yip",
      company: "Tsim Sha Tsui Nails",
      value_cents: hkd(9800),
      stage: "new",
      source: "Web",
      score: 55,
      owner: "Concierge",
      created_at: ago(3 * HOUR),
      updated_at: ago(3 * HOUR),
    },
    {
      id: "lead-008",
      name: "Oliver Fung",
      company: "Repulse Bay Pilates",
      value_cents: hkd(21000),
      stage: "won",
      source: "WhatsApp",
      score: 93,
      owner: "Nurture",
      created_at: ago(17 * DAY),
      updated_at: ago(4 * DAY),
    },
    {
      id: "lead-009",
      name: "Hannah Lee",
      company: "Sai Kung Pet Clinic",
      value_cents: hkd(16500),
      stage: "qualified",
      source: "Ads",
      score: 76,
      owner: "Leadgen",
      created_at: ago(5 * DAY),
      updated_at: ago(20 * HOUR),
    },
    {
      id: "lead-010",
      name: "Raymond Cheung",
      company: "Mong Kok Print Lab",
      value_cents: hkd(12000),
      stage: "lost",
      source: "Web",
      score: 34,
      owner: "Nurture",
      created_at: ago(14 * DAY),
      updated_at: ago(6 * DAY),
    },
    {
      id: "lead-011",
      name: "Isabella Tsang",
      company: "Wan Chai Brow Bar",
      value_cents: hkd(8500),
      stage: "booked",
      source: "Web",
      score: 79,
      owner: "Scheduler",
      created_at: ago(2 * DAY),
      updated_at: ago(6 * HOUR),
    },
    {
      id: "lead-012",
      name: "Nathan Au",
      company: "Quarry Bay Strength Co",
      value_cents: hkd(19500),
      stage: "new",
      source: "Referral",
      score: 67,
      owner: "Leadgen",
      created_at: ago(16 * HOUR),
      updated_at: ago(16 * HOUR),
    },
    {
      id: "lead-013",
      name: "Chloe Wan",
      company: "Stanley Med Aesthetics",
      value_cents: hkd(54000),
      stage: "qualified",
      source: "Ads",
      score: 89,
      owner: "Concierge",
      created_at: ago(7 * DAY),
      updated_at: ago(1 * DAY),
    },
    {
      id: "lead-014",
      name: "Felix Ng",
      company: "Causeway Bay Optometry",
      value_cents: hkd(23000),
      stage: "lost",
      source: "WhatsApp",
      score: 41,
      owner: "Nurture",
      created_at: ago(19 * DAY),
      updated_at: ago(9 * DAY),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Conversations (~10) with a few messages each
// ===========================================================================

interface DemoThread {
  conversation: Omit<Conversation, "org_id">;
  messages: Array<Pick<Message, "role" | "body"> & { offset: number }>;
}

const DEMO_THREADS: DemoThread[] = [
  {
    conversation: {
      id: "conv-001",
      contact_name: "Grace Yip",
      channel: "web",
      subject: "Gel manicure pricing",
      status: "open",
      last_at: ago(12 * MIN),
      created_at: ago(40 * MIN),
    },
    messages: [
      { role: "visitor", body: "Hi, how much is a gel manicure and do you take walk-ins today?", offset: 40 * MIN },
      { role: "agent", body: "Hi Grace, a gel manicure is HK$280 and takes about 45 minutes. We have openings at 4pm and 5:30pm today. Would you like me to hold one for you?", offset: 38 * MIN },
      { role: "visitor", body: "4pm works, can I get the chrome finish too?", offset: 12 * MIN },
    ],
  },
  {
    conversation: {
      id: "conv-002",
      contact_name: "Dr. Amelia Wong",
      channel: "email",
      subject: "Implant consultation follow-up",
      status: "waiting",
      last_at: ago(3 * HOUR),
      created_at: ago(2 * DAY),
    },
    messages: [
      { role: "visitor", body: "Following up on the implant quote you sent. Is the HK$48,000 inclusive of the crown?", offset: 2 * DAY },
      { role: "agent", body: "Yes, that figure covers the implant, abutment, and porcelain crown. It excludes any bone graft if needed, which we would confirm at the planning scan.", offset: 2 * DAY - 30 * MIN },
      { role: "human", body: "Adding a note: Dr. Lau can do the planning scan next Tuesday morning if she wants the earliest slot.", offset: 3 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-003",
      contact_name: "Kenji Tanaka",
      channel: "whatsapp",
      subject: "Physio session rebooking",
      status: "open",
      last_at: ago(35 * MIN),
      created_at: ago(1 * DAY),
    },
    messages: [
      { role: "visitor", body: "Need to move my Thursday physio session, something came up at work", offset: 1 * DAY },
      { role: "agent", body: "No problem Kenji. I have Friday 3pm or Saturday 10am open with the same therapist. Which suits you?", offset: 1 * DAY - 20 * MIN },
      { role: "visitor", body: "Friday 3pm please", offset: 35 * MIN },
    ],
  },
  {
    conversation: {
      id: "conv-004",
      contact_name: "Priya Nair",
      channel: "ig",
      subject: "Facial package question",
      status: "open",
      last_at: ago(1 * HOUR),
      created_at: ago(3 * DAY),
    },
    messages: [
      { role: "visitor", body: "Saw your hydrafacial post. Do you offer a package of 3 sessions?", offset: 3 * DAY },
      { role: "agent", body: "We do. The 3-session hydrafacial package is HK$2,400, which saves you HK$300 versus single sessions. Would you like to book the first one this week?", offset: 1 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-005",
      contact_name: "Marcus Ho",
      channel: "whatsapp",
      subject: "Wholesale order",
      status: "waiting",
      last_at: ago(5 * HOUR),
      created_at: ago(2 * DAY),
    },
    messages: [
      { role: "visitor", body: "Can I get a wholesale price list for the glassware range?", offset: 2 * DAY },
      { role: "agent", body: "Sent the wholesale sheet to your email. Minimum order is 24 units and we ship same day for orders before 2pm. Let me know if you want me to start a quote.", offset: 5 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-006",
      contact_name: "David Chan",
      channel: "email",
      subject: "Year-end tax planning",
      status: "open",
      last_at: ago(20 * HOUR),
      created_at: ago(8 * DAY),
    },
    messages: [
      { role: "visitor", body: "We are a 12-person firm. What does your year-end tax planning engagement look like and what would it cost?", offset: 8 * DAY },
      { role: "agent", body: "For a firm your size the planning engagement is typically HK$60,000 to HK$75,000 depending on entity count. It includes a strategy session, provisional tax review, and filing prep. Shall I set up a 30-minute call with one of our partners?", offset: 7 * DAY },
      { role: "visitor", body: "Yes please, ideally next week.", offset: 20 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-007",
      contact_name: "Sophie Lam",
      channel: "web",
      subject: "Trial class",
      status: "open",
      last_at: ago(2 * HOUR),
      created_at: ago(9 * HOUR),
    },
    messages: [
      { role: "visitor", body: "Do you have a free trial yoga class for beginners?", offset: 9 * HOUR },
      { role: "agent", body: "We do. The next beginner-friendly trial is Saturday 9am and it is complimentary for first-timers. Want me to reserve a mat for you?", offset: 2 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-008",
      contact_name: "Oliver Fung",
      channel: "whatsapp",
      subject: "Membership renewal",
      status: "closed",
      last_at: ago(4 * DAY),
      created_at: ago(5 * DAY),
    },
    messages: [
      { role: "visitor", body: "I would like to renew my 10-class pilates pack", offset: 5 * DAY },
      { role: "agent", body: "Done. Your new 10-class pack is active and the receipt is on its way. You have 8 weeks to use them. See you Wednesday.", offset: 4 * DAY },
      { role: "visitor", body: "Perfect, thanks!", offset: 4 * DAY - 10 * MIN },
    ],
  },
  {
    conversation: {
      id: "conv-009",
      contact_name: "Isabella Tsang",
      channel: "ig",
      subject: "Brow lamination",
      status: "waiting",
      last_at: ago(6 * HOUR),
      created_at: ago(2 * DAY),
    },
    messages: [
      { role: "visitor", body: "How long does brow lamination last and is there downtime?", offset: 2 * DAY },
      { role: "agent", body: "It lasts about 6 to 8 weeks with no real downtime, just keep the brows dry for 24 hours after. We have a slot Thursday 6pm if you would like it.", offset: 6 * HOUR },
    ],
  },
  {
    conversation: {
      id: "conv-010",
      contact_name: "Hannah Lee",
      channel: "web",
      subject: "Vaccination appointment",
      status: "open",
      last_at: ago(50 * MIN),
      created_at: ago(1 * DAY),
    },
    messages: [
      { role: "visitor", body: "My puppy needs her second round of vaccinations, what do you have this week?", offset: 1 * DAY },
      { role: "agent", body: "We can see her Wednesday or Friday afternoon. The second-round vaccination is HK$650 including the wellness check. Which day works for you?", offset: 50 * MIN },
    ],
  },
];

export function demoConversations(): Conversation[] {
  return DEMO_THREADS.map((t) => ({ ...t.conversation, org_id: DEMO_ORG }));
}

export function demoConversation(id: string): ConversationWithMessages | null {
  const thread = DEMO_THREADS.find((t) => t.conversation.id === id);
  if (!thread) return null;
  const messages: Message[] = thread.messages.map((m, i) => ({
    id: `${id}-msg-${i + 1}`,
    conversation_id: id,
    role: m.role,
    body: m.body,
    created_at: ago(m.offset),
  }));
  return { ...thread.conversation, org_id: DEMO_ORG, messages };
}

// ===========================================================================
// Actions (~8): pending approvals + recent approved/auto audit trail
// ===========================================================================
export function demoActions(): ActionItem[] {
  const rows: Array<Omit<ActionItem, "org_id">> = [
    {
      id: "act-001",
      agent_id: "inbox",
      type: "draft_reply",
      summary: "Draft reply to Harbour Dental on implant crown question",
      detail: { conversation_id: "conv-002", confidence: 0.94 },
      status: "pending",
      created_at: ago(25 * MIN),
      decided_at: null,
      decided_by: null,
    },
    {
      id: "act-002",
      agent_id: "scheduler",
      type: "book_call",
      summary: "Book call Fri 3pm with Kenji Tanaka (Kowloon Physio)",
      detail: { lead_id: "lead-004", slot: "Fri 15:00" },
      status: "pending",
      created_at: ago(34 * MIN),
      decided_at: null,
      decided_by: null,
    },
    {
      id: "act-003",
      agent_id: "nurture",
      type: "bulk_followup",
      summary: "Send follow-up to 12 dormant leads (no reply in 14 days)",
      detail: { count: 12, template: "reactivation-1" },
      status: "pending",
      created_at: ago(2 * HOUR),
      decided_at: null,
      decided_by: null,
    },
    {
      id: "act-004",
      agent_id: "leadgen",
      type: "send_quote",
      summary: "Send year-end tax planning quote to David Chan",
      detail: { lead_id: "lead-006", value_cents: hkd(72000) },
      status: "pending",
      created_at: ago(3 * HOUR),
      decided_at: null,
      decided_by: null,
    },
    {
      id: "act-005",
      agent_id: "concierge",
      type: "auto_reply",
      summary: "Answered pricing question for Grace Yip and offered a 4pm slot",
      detail: { conversation_id: "conv-001" },
      status: "auto",
      created_at: ago(38 * MIN),
      decided_at: ago(38 * MIN),
      decided_by: "concierge",
    },
    {
      id: "act-006",
      agent_id: "scheduler",
      type: "book_call",
      summary: "Booked trial class for Sophie Lam on Saturday 9am",
      detail: { lead_id: "lead-005", slot: "Sat 09:00" },
      status: "approved",
      created_at: ago(2 * HOUR),
      decided_at: ago(105 * MIN),
      decided_by: "You",
    },
    {
      id: "act-007",
      agent_id: "nurture",
      type: "send_followup",
      summary: "Sent renewal reminder to Oliver Fung (membership lapsing)",
      detail: { lead_id: "lead-008" },
      status: "auto",
      created_at: ago(4 * DAY),
      decided_at: ago(4 * DAY),
      decided_by: "nurture",
    },
    {
      id: "act-008",
      agent_id: "ops",
      type: "daily_summary",
      summary: "Posted yesterday's pipeline and inbox summary to the team",
      detail: { new_leads: 3, replies: 21 },
      status: "auto",
      created_at: ago(20 * HOUR),
      decided_at: ago(20 * HOUR),
      decided_by: "ops",
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Agent configs for all six agents
// ===========================================================================
export function demoAgentConfigs(): AgentConfig[] {
  const rows: Array<Omit<AgentConfig, "org_id" | "id">> = [
    {
      agent_id: "concierge",
      enabled: true,
      autonomy: "auto",
      instructions:
        "Greet every website visitor within seconds, answer questions about services, pricing, and hours, and offer to book a call or appointment. Stay warm and concise.",
      guardrails: {
        never_quote_above_cents: hkd(50000),
        escalate_keywords: ["refund", "complaint", "lawyer"],
      },
      updated_at: ago(2 * DAY),
    },
    {
      agent_id: "inbox",
      enabled: true,
      autonomy: "approve",
      instructions:
        "Draft replies to incoming email and DMs in the brand voice. Surface drafts for approval before sending when the topic is pricing, medical, or legal.",
      guardrails: {
        require_approval_for: ["pricing", "medical", "legal"],
        max_attachments: 3,
      },
      updated_at: ago(1 * DAY),
    },
    {
      agent_id: "scheduler",
      enabled: true,
      autonomy: "approve",
      instructions:
        "Offer open calendar slots, hold and confirm bookings, and send reminders. Never double-book and respect buffer times between appointments.",
      guardrails: {
        buffer_minutes: 15,
        booking_window_days: 30,
      },
      updated_at: ago(3 * DAY),
    },
    {
      agent_id: "leadgen",
      enabled: true,
      autonomy: "approve",
      instructions:
        "Identify and qualify inbound leads, enrich them with company details, and propose next steps. Send quotes only after approval.",
      guardrails: {
        require_approval_for: ["send_quote"],
        min_score_to_qualify: 60,
      },
      updated_at: ago(5 * DAY),
    },
    {
      agent_id: "nurture",
      enabled: true,
      autonomy: "approve",
      instructions:
        "Follow up with leads that go quiet across email and SMS until they book or opt out. Keep messages helpful, not pushy, and respect quiet hours.",
      guardrails: {
        max_followups: 4,
        quiet_hours: "21:00-09:00",
      },
      updated_at: ago(1 * DAY),
    },
    {
      agent_id: "ops",
      enabled: true,
      autonomy: "auto",
      instructions:
        "Compile a daily summary of pipeline movement, inbox volume, and bookings, and flag anything that needs a human. Run reports on schedule.",
      guardrails: {
        report_time: "08:30",
        flag_if_response_time_over_seconds: 600,
      },
      updated_at: ago(6 * DAY),
    },
  ];

  return rows.map((r) => ({
    ...r,
    id: `agentcfg-${r.agent_id}`,
    org_id: DEMO_ORG,
  }));
}

// ===========================================================================
// Knowledge docs (~5)
// ===========================================================================
export function demoKnowledge(): KnowledgeDoc[] {
  const rows: Array<Omit<KnowledgeDoc, "org_id">> = [
    {
      id: "kdoc-001",
      title: "Services and pricing",
      source: "upload",
      status: "ready",
      chunks: 42,
      created_at: ago(12 * DAY),
      tags: ["Pricing", "Services", "Sales"],
    },
    {
      id: "kdoc-002",
      title: "Frequently asked questions",
      source: "faq",
      status: "ready",
      chunks: 28,
      created_at: ago(12 * DAY),
      tags: ["Support", "Services", "Booking"],
    },
    {
      id: "kdoc-003",
      title: "Booking and cancellation policy",
      source: "upload",
      status: "ready",
      chunks: 11,
      created_at: ago(10 * DAY),
      tags: ["Booking", "Policy", "Support"],
    },
    {
      id: "kdoc-004",
      title: "Brand voice and tone guide",
      source: "upload",
      status: "ready",
      chunks: 9,
      created_at: ago(9 * DAY),
      tags: ["Brand", "Voice"],
    },
    {
      id: "kdoc-005",
      title: "Website pages (crawled)",
      source: "url",
      status: "ready",
      chunks: 64,
      created_at: ago(8 * DAY),
      tags: ["Services", "Pricing", "Brand"],
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Overview metrics (honest, real-shaped fixed numbers)
// ===========================================================================
export function demoMetrics(): OverviewMetrics {
  return {
    leadsThisWeek: 9,
    bookings: 6,
    responseTimeSeconds: 38,
    conversionRate: 0.31,
    messagesHandled: 247,
    pipelineValueCents: hkd(48000 + 18500 + 32000 + 26000 + 72000 + 8500 + 54000),
  };
}
