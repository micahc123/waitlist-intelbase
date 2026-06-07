// Onboarding wizard configuration: the connect-grid integrations and the
// selectable goal chips. Pure data, safe to import on the server or client.
//
// `icon` is a lucide-react icon name (resolved on the client via a small map in
// the wizard component). `accent` is one of the Intelbase brand colors.

export type ConnectorAccent =
  | "blue"
  | "mint"
  | "violet"
  | "amber"
  | "pink";

export type Connector = {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide-react icon name
  accent: ConnectorAccent;
};

// The 6 integrations shown as connect cards in step 2. Connecting is simulated
// for now (toggles local state); the chosen ids are persisted via the
// saveConnections server action.
export const CONNECTORS: Connector[] = [
  {
    id: "website-chat",
    label: "Website Chat",
    description: "Answer every visitor on your site, 24/7.",
    icon: "MessageSquare",
    accent: "blue",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Reply to leads where they already message you.",
    icon: "MessageCircle",
    accent: "mint",
  },
  {
    id: "email-inbox",
    label: "Email Inbox",
    description: "Triage and follow up on inbound email.",
    icon: "Mail",
    accent: "violet",
  },
  {
    id: "meta-ads",
    label: "Meta Ads",
    description: "Run and optimize your Facebook & Instagram ads.",
    icon: "Megaphone",
    accent: "amber",
  },
  {
    id: "calendar",
    label: "Calendar / Booking",
    description: "Let Intelbase book calls straight into your calendar.",
    icon: "CalendarClock",
    accent: "pink",
  },
  {
    id: "crm",
    label: "CRM",
    description: "Sync contacts and deals with your CRM.",
    icon: "Database",
    accent: "blue",
  },
];

export type Goal = {
  id: string;
  label: string;
};

// Multi-select goal chips shown in step 3 (local state only for now).
export const GOALS: Goal[] = [
  { id: "answer-leads", label: "Answer leads 24/7" },
  { id: "book-calls", label: "Book more calls" },
  { id: "follow-up", label: "Follow up automatically" },
  { id: "run-ads", label: "Run my ads" },
  { id: "reactivate", label: "Reactivate old leads" },
  { id: "one-dashboard", label: "One dashboard" },
];
