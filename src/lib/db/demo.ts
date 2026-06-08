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
  AppNotification,
  Automation,
  CalendarEvent,
  Contact,
  Conversation,
  ConversationWithMessages,
  KnowledgeDoc,
  Lead,
  Message,
  OverviewMetrics,
  Task,
  TeamMember,
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

// Forward-looking counterpart to ago(), for upcoming calendar events.
function fromNow(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
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

// ===========================================================================
// Contacts (~16): customers, vendors, partners, plus a couple of team/lead
// ===========================================================================
export function demoContacts(): Contact[] {
  const rows: Array<Omit<Contact, "org_id">> = [
    {
      id: "contact-001",
      name: "Dr. Amelia Wong",
      company: "Harbour Dental",
      email: "amelia@harbourdental.hk",
      phone: "+852 2543 1180",
      channel: "referral",
      type: "customer",
      tags: ["vip", "dental", "implants"],
      last_contact_at: ago(2 * DAY),
      value_cents: hkd(48000),
      created_at: ago(60 * DAY),
    },
    {
      id: "contact-002",
      name: "Marcus Ho",
      company: "North X Smoke Shop",
      email: "marcus@northx.hk",
      phone: "+852 9123 4477",
      channel: "ads",
      type: "customer",
      tags: ["wholesale", "retail"],
      last_contact_at: ago(8 * HOUR),
      value_cents: hkd(18500),
      created_at: ago(40 * DAY),
    },
    {
      id: "contact-003",
      name: "Priya Nair",
      company: "Conscious Soul Skin",
      email: "priya@conscioussoul.hk",
      phone: "+852 6781 2290",
      channel: "web",
      type: "customer",
      tags: ["skincare", "package"],
      last_contact_at: ago(5 * HOUR),
      value_cents: hkd(32000),
      created_at: ago(22 * DAY),
    },
    {
      id: "contact-004",
      name: "Kenji Tanaka",
      company: "Kowloon Physio",
      email: "kenji@kowloonphysio.hk",
      phone: "+852 5500 8821",
      channel: "whatsapp",
      type: "customer",
      tags: ["physio", "recurring"],
      last_contact_at: ago(12 * HOUR),
      value_cents: hkd(26000),
      created_at: ago(31 * DAY),
    },
    {
      id: "contact-005",
      name: "David Chan",
      company: "Central Tax Advisory",
      email: "david@centraltax.hk",
      phone: "+852 2110 3344",
      channel: "referral",
      type: "customer",
      tags: ["enterprise", "tax", "high-value"],
      last_contact_at: ago(1 * DAY),
      value_cents: hkd(72000),
      created_at: ago(50 * DAY),
    },
    {
      id: "contact-006",
      name: "Oliver Fung",
      company: "Repulse Bay Pilates",
      email: "oliver@rbpilates.hk",
      phone: "+852 9876 1200",
      channel: "whatsapp",
      type: "customer",
      tags: ["membership", "fitness"],
      last_contact_at: ago(4 * DAY),
      value_cents: hkd(21000),
      created_at: ago(48 * DAY),
    },
    {
      id: "contact-007",
      name: "Chloe Wan",
      company: "Stanley Med Aesthetics",
      email: "chloe@stanleymed.hk",
      phone: "+852 6234 7788",
      channel: "ads",
      type: "customer",
      tags: ["aesthetics", "high-value"],
      last_contact_at: ago(1 * DAY),
      value_cents: hkd(54000),
      created_at: ago(28 * DAY),
    },
    {
      id: "contact-008",
      name: "Lucas Pereira",
      company: "Kwai Chung Logistics",
      email: "lucas@kclogistics.hk",
      phone: "+852 2789 5512",
      channel: "email",
      type: "vendor",
      tags: ["shipping", "fulfilment"],
      last_contact_at: ago(6 * DAY),
      value_cents: 0,
      created_at: ago(90 * DAY),
    },
    {
      id: "contact-009",
      name: "Wendy Sit",
      company: "Island Print House",
      email: "wendy@islandprint.hk",
      phone: "+852 2456 0098",
      channel: "email",
      type: "vendor",
      tags: ["printing", "marketing"],
      last_contact_at: ago(11 * DAY),
      value_cents: 0,
      created_at: ago(120 * DAY),
    },
    {
      id: "contact-010",
      name: "Anthony Lo",
      company: "Pacific Coffee Supply",
      email: "anthony@pacsupply.hk",
      phone: "+852 9001 7766",
      channel: "phone",
      type: "vendor",
      tags: ["supplies", "monthly"],
      last_contact_at: ago(3 * DAY),
      value_cents: 0,
      created_at: ago(75 * DAY),
    },
    {
      id: "contact-011",
      name: "Sandra Ip",
      company: "Bright Web Studio",
      email: "sandra@brightweb.hk",
      phone: "+852 6655 2030",
      channel: "referral",
      type: "partner",
      tags: ["agency", "referrals"],
      last_contact_at: ago(7 * DAY),
      value_cents: hkd(15000),
      created_at: ago(110 * DAY),
    },
    {
      id: "contact-012",
      name: "Jason Kwok",
      company: "HK Wellness Network",
      email: "jason@hkwellness.hk",
      phone: "+852 9234 1199",
      channel: "web",
      type: "partner",
      tags: ["network", "co-marketing"],
      last_contact_at: ago(13 * DAY),
      value_cents: hkd(9000),
      created_at: ago(95 * DAY),
    },
    {
      id: "contact-013",
      name: "Elaine Tong",
      company: "Mira Beauty Group",
      email: "elaine@mirabeauty.hk",
      phone: "+852 6890 3321",
      channel: "referral",
      type: "partner",
      tags: ["reseller"],
      last_contact_at: ago(20 * DAY),
      value_cents: hkd(12500),
      created_at: ago(130 * DAY),
    },
    {
      id: "contact-014",
      name: "Sophie Lam",
      company: "Lamma Yoga Collective",
      email: "sophie@lammayoga.hk",
      phone: "+852 9345 6677",
      channel: "ads",
      type: "lead",
      tags: ["trial", "fitness"],
      last_contact_at: ago(2 * HOUR),
      value_cents: 0,
      created_at: ago(9 * HOUR),
    },
    {
      id: "contact-015",
      name: "Grace Yip",
      company: "Tsim Sha Tsui Nails",
      email: "grace@tstnails.hk",
      phone: "+852 6112 8890",
      channel: "web",
      type: "lead",
      tags: ["walk-in"],
      last_contact_at: ago(3 * HOUR),
      value_cents: 0,
      created_at: ago(3 * HOUR),
    },
    {
      id: "contact-016",
      name: "Rachel Sun",
      company: null,
      email: "rachel@intelbase.app",
      phone: "+852 9555 0102",
      channel: "team",
      type: "team",
      tags: ["operations"],
      last_contact_at: ago(5 * HOUR),
      value_cents: 0,
      created_at: ago(180 * DAY),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Tasks (~12) across todo / doing / done, several agent-created
// ===========================================================================
export function demoTasks(): Task[] {
  const rows: Array<Omit<Task, "org_id">> = [
    {
      id: "task-001",
      title: "Call David Chan to confirm tax planning scope",
      detail: "He wants a 30-minute partner call next week. Confirm entity count.",
      status: "todo",
      priority: "high",
      due_at: fromNow(1 * DAY),
      assignee: "You",
      source: "human",
      agent_id: null,
      created_at: ago(20 * HOUR),
    },
    {
      id: "task-002",
      title: "Approve reactivation campaign for dormant leads",
      detail: "Nurture agent queued a follow-up to 12 leads with no reply in 14 days.",
      status: "todo",
      priority: "high",
      due_at: fromNow(6 * HOUR),
      assignee: "You",
      source: "agent",
      agent_id: "nurture",
      created_at: ago(2 * HOUR),
    },
    {
      id: "task-003",
      title: "Send wholesale price sheet to Marcus Ho",
      detail: "Glassware range, minimum order 24 units.",
      status: "doing",
      priority: "med",
      due_at: fromNow(4 * HOUR),
      assignee: "Rachel Sun",
      source: "human",
      agent_id: null,
      created_at: ago(5 * HOUR),
    },
    {
      id: "task-004",
      title: "Prepare implant quote follow-up for Harbour Dental",
      detail: "Confirm crown inclusion and planning scan slot.",
      status: "doing",
      priority: "med",
      due_at: fromNow(1 * DAY),
      assignee: "You",
      source: "agent",
      agent_id: "inbox",
      created_at: ago(25 * MIN),
    },
    {
      id: "task-005",
      title: "Review brand voice guide updates",
      detail: "New tone notes from last week need a quick read before publishing.",
      status: "todo",
      priority: "low",
      due_at: fromNow(3 * DAY),
      assignee: "You",
      source: "human",
      agent_id: null,
      created_at: ago(1 * DAY),
    },
    {
      id: "task-006",
      title: "Restock retail display before weekend",
      detail: null,
      status: "todo",
      priority: "med",
      due_at: fromNow(2 * DAY),
      assignee: "Rachel Sun",
      source: "human",
      agent_id: null,
      created_at: ago(18 * HOUR),
    },
    {
      id: "task-007",
      title: "Confirm Saturday trial class capacity",
      detail: "Scheduler booked Sophie Lam; check mat availability.",
      status: "doing",
      priority: "low",
      due_at: fromNow(2 * DAY),
      assignee: "Rachel Sun",
      source: "agent",
      agent_id: "scheduler",
      created_at: ago(2 * HOUR),
    },
    {
      id: "task-008",
      title: "Post yesterday's pipeline summary to the team",
      detail: "Ops agent compiled it; just needs a glance.",
      status: "done",
      priority: "low",
      due_at: ago(20 * HOUR),
      assignee: "You",
      source: "agent",
      agent_id: "ops",
      created_at: ago(21 * HOUR),
    },
    {
      id: "task-009",
      title: "Book Friday physio session for Kenji Tanaka",
      detail: "Rebooked from Thursday at his request.",
      status: "done",
      priority: "med",
      due_at: ago(30 * MIN),
      assignee: "You",
      source: "agent",
      agent_id: "scheduler",
      created_at: ago(35 * MIN),
    },
    {
      id: "task-010",
      title: "Renew Oliver Fung's pilates pack",
      detail: "10-class pack activated and receipt sent.",
      status: "done",
      priority: "low",
      due_at: ago(4 * DAY),
      assignee: "Rachel Sun",
      source: "human",
      agent_id: null,
      created_at: ago(5 * DAY),
    },
    {
      id: "task-011",
      title: "Chase Island Print House on flyer proof",
      detail: "Vendor proof is two days late.",
      status: "todo",
      priority: "med",
      due_at: fromNow(12 * HOUR),
      assignee: "Rachel Sun",
      source: "human",
      agent_id: null,
      created_at: ago(11 * DAY),
    },
    {
      id: "task-012",
      title: "Reply to Priya Nair on hydrafacial package",
      detail: "She asked about the 3-session bundle.",
      status: "doing",
      priority: "med",
      due_at: fromNow(3 * HOUR),
      assignee: "You",
      source: "agent",
      agent_id: "inbox",
      created_at: ago(1 * HOUR),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Calendar events (~10) across this week and next
// ===========================================================================
export function demoCalendar(): CalendarEvent[] {
  const rows: Array<Omit<CalendarEvent, "org_id">> = [
    {
      id: "cal-001",
      title: "Physio session - Kenji Tanaka",
      start_at: fromNow(2 * HOUR),
      end_at: fromNow(3 * HOUR),
      attendee: "Kenji Tanaka",
      channel: "in-person",
      status: "confirmed",
      location: "Kowloon Physio - Room 2",
      booked_by: "scheduler",
      created_at: ago(35 * MIN),
    },
    {
      id: "cal-002",
      title: "Gel manicure - Grace Yip",
      start_at: fromNow(5 * HOUR),
      end_at: fromNow(5 * HOUR + 45 * MIN),
      attendee: "Grace Yip",
      channel: "in-person",
      status: "confirmed",
      location: "TST Nails - Station 3",
      booked_by: "scheduler",
      created_at: ago(38 * MIN),
    },
    {
      id: "cal-003",
      title: "Implant planning scan - Harbour Dental",
      start_at: fromNow(1 * DAY + 3 * HOUR),
      end_at: fromNow(1 * DAY + 4 * HOUR),
      attendee: "Dr. Amelia Wong",
      channel: "in-person",
      status: "tentative",
      location: "Harbour Dental",
      booked_by: "You",
      created_at: ago(3 * HOUR),
    },
    {
      id: "cal-004",
      title: "Tax planning call - David Chan",
      start_at: fromNow(2 * DAY + 2 * HOUR),
      end_at: fromNow(2 * DAY + 2 * HOUR + 30 * MIN),
      attendee: "David Chan",
      channel: "phone",
      status: "tentative",
      location: "Phone call",
      booked_by: "scheduler",
      created_at: ago(20 * HOUR),
    },
    {
      id: "cal-005",
      title: "Hydrafacial - Priya Nair",
      start_at: fromNow(3 * DAY + 1 * HOUR),
      end_at: fromNow(3 * DAY + 2 * HOUR),
      attendee: "Priya Nair",
      channel: "in-person",
      status: "confirmed",
      location: "Conscious Soul Skin",
      booked_by: "scheduler",
      created_at: ago(1 * HOUR),
    },
    {
      id: "cal-006",
      title: "Pacific Coffee Supply - monthly delivery",
      start_at: fromNow(4 * DAY),
      end_at: fromNow(4 * DAY + 30 * MIN),
      attendee: "Anthony Lo",
      channel: "in-person",
      status: "confirmed",
      location: "Storeroom",
      booked_by: "You",
      created_at: ago(3 * DAY),
    },
    {
      id: "cal-007",
      title: "Beginner yoga trial - Sophie Lam",
      start_at: fromNow(5 * DAY + 9 * HOUR),
      end_at: fromNow(5 * DAY + 10 * HOUR),
      attendee: "Sophie Lam",
      channel: "in-person",
      status: "confirmed",
      location: "Lamma Yoga Collective",
      booked_by: "scheduler",
      created_at: ago(2 * HOUR),
    },
    {
      id: "cal-008",
      title: "Partner sync - Bright Web Studio",
      start_at: fromNow(7 * DAY + 4 * HOUR),
      end_at: fromNow(7 * DAY + 5 * HOUR),
      attendee: "Sandra Ip",
      channel: "video",
      status: "tentative",
      location: "Video call",
      booked_by: "You",
      created_at: ago(2 * DAY),
    },
    {
      id: "cal-009",
      title: "Brow lamination - Isabella Tsang",
      start_at: fromNow(8 * DAY + 6 * HOUR),
      end_at: fromNow(8 * DAY + 7 * HOUR),
      attendee: "Isabella Tsang",
      channel: "in-person",
      status: "confirmed",
      location: "Wan Chai Brow Bar",
      booked_by: "scheduler",
      created_at: ago(6 * HOUR),
    },
    {
      id: "cal-010",
      title: "Puppy vaccination - Hannah Lee",
      start_at: fromNow(9 * DAY + 2 * HOUR),
      end_at: fromNow(9 * DAY + 2 * HOUR + 30 * MIN),
      attendee: "Hannah Lee",
      channel: "in-person",
      status: "confirmed",
      location: "Sai Kung Pet Clinic",
      booked_by: "scheduler",
      created_at: ago(50 * MIN),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Automations (~5) - readable trigger + steps jsonb
// ===========================================================================
export function demoAutomations(): Automation[] {
  const rows: Array<Omit<Automation, "org_id">> = [
    {
      id: "auto-001",
      name: "New Ads lead welcome",
      enabled: true,
      trigger: { event: "lead.created", source: "ads" },
      steps: [
        { type: "send_email", template: "welcome" },
        { type: "book_call" },
      ],
      last_run_at: ago(9 * HOUR),
      runs: 134,
      created_at: ago(45 * DAY),
    },
    {
      id: "auto-002",
      name: "Quiet lead reactivation",
      enabled: true,
      trigger: { event: "lead.idle", days: 14 },
      steps: [
        { type: "send_followup", template: "reactivation-1" },
        { type: "wait", days: 3 },
        { type: "send_followup", template: "reactivation-2" },
      ],
      last_run_at: ago(2 * HOUR),
      runs: 58,
      created_at: ago(38 * DAY),
    },
    {
      id: "auto-003",
      name: "Booking reminder",
      enabled: true,
      trigger: { event: "booking.upcoming", hours_before: 24 },
      steps: [
        { type: "send_whatsapp", template: "reminder-24h" },
        { type: "send_whatsapp", template: "reminder-2h", hours_before: 2 },
      ],
      last_run_at: ago(5 * HOUR),
      runs: 412,
      created_at: ago(60 * DAY),
    },
    {
      id: "auto-004",
      name: "Won deal thank-you",
      enabled: false,
      trigger: { event: "lead.stage_changed", to: "won" },
      steps: [
        { type: "send_email", template: "thank-you" },
        { type: "request_review", channel: "google" },
      ],
      last_run_at: ago(6 * DAY),
      runs: 27,
      created_at: ago(30 * DAY),
    },
    {
      id: "auto-005",
      name: "Daily ops summary",
      enabled: true,
      trigger: { event: "schedule.daily", at: "08:30" },
      steps: [
        { type: "compile_summary", scope: ["pipeline", "inbox", "bookings"] },
        { type: "post_to_team", channel: "ops" },
      ],
      last_run_at: ago(20 * HOUR),
      runs: 96,
      created_at: ago(50 * DAY),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Notifications (~8) mixed read/unread across kinds
// ===========================================================================
export function demoNotifications(): AppNotification[] {
  const rows: Array<Omit<AppNotification, "org_id">> = [
    {
      id: "notif-001",
      kind: "approval",
      title: "3 actions awaiting approval",
      body: "Inbox, Scheduler, and Nurture have drafts ready for you.",
      read: false,
      link: "approvals",
      created_at: ago(25 * MIN),
    },
    {
      id: "notif-002",
      kind: "lead",
      title: "New lead from Ads",
      body: "Sophie Lam (Lamma Yoga Collective) just came in.",
      read: false,
      link: "leads",
      created_at: ago(9 * HOUR),
    },
    {
      id: "notif-003",
      kind: "inbox",
      title: "New reply from Kenji Tanaka",
      body: "Confirmed Friday 3pm for his physio session.",
      read: false,
      link: "inbox",
      created_at: ago(35 * MIN),
    },
    {
      id: "notif-004",
      kind: "agent",
      title: "Concierge answered a pricing question",
      body: "Replied to Grace Yip and offered a 4pm slot.",
      read: true,
      link: "approvals",
      created_at: ago(38 * MIN),
    },
    {
      id: "notif-005",
      kind: "lead",
      title: "Deal won: Harbour Dental",
      body: "Dr. Amelia Wong moved to won (HK$48,000).",
      read: true,
      link: "leads",
      created_at: ago(2 * DAY),
    },
    {
      id: "notif-006",
      kind: "system",
      title: "Knowledge base updated",
      body: "Website pages were re-crawled and indexed.",
      read: true,
      link: "knowledge",
      created_at: ago(8 * DAY),
    },
    {
      id: "notif-007",
      kind: "agent",
      title: "Nurture queued a reactivation batch",
      body: "12 dormant leads pending your approval.",
      read: false,
      link: "automations",
      created_at: ago(2 * HOUR),
    },
    {
      id: "notif-008",
      kind: "inbox",
      title: "New message from Priya Nair",
      body: "Asked about the 3-session hydrafacial package.",
      read: true,
      link: "inbox",
      created_at: ago(1 * HOUR),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}

// ===========================================================================
// Team members (~4): owner (the user) + 2 active + 1 invited
// ===========================================================================
export function demoTeam(): TeamMember[] {
  const rows: Array<Omit<TeamMember, "org_id">> = [
    {
      id: "team-001",
      email: "you@intelbase.app",
      name: "You",
      role: "owner",
      status: "active",
      invited_at: ago(180 * DAY),
      created_at: ago(180 * DAY),
    },
    {
      id: "team-002",
      email: "rachel@intelbase.app",
      name: "Rachel Sun",
      role: "admin",
      status: "active",
      invited_at: ago(120 * DAY),
      created_at: ago(120 * DAY),
    },
    {
      id: "team-003",
      email: "marcus@intelbase.app",
      name: "Marcus Lai",
      role: "member",
      status: "active",
      invited_at: ago(45 * DAY),
      created_at: ago(45 * DAY),
    },
    {
      id: "team-004",
      email: "jordan@intelbase.app",
      name: null,
      role: "viewer",
      status: "invited",
      invited_at: ago(3 * DAY),
      created_at: ago(3 * DAY),
    },
  ];

  return rows.map((r) => ({ ...r, org_id: DEMO_ORG }));
}
