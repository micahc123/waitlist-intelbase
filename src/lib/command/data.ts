import type { GraphNode, Link, DomainId } from "./types";
import { fibSphere, risingSeries, seededRand } from "./seed";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function s(seed: number) {
  return seededRand(seed);
}

function pickStatus(
  seed: number,
): "active" | "idle" | "working" {
  const v = s(seed);
  if (v < 0.5) return "active";
  if (v < 0.75) return "working";
  return "idle";
}

// ---------------------------------------------------------------------------
// Agent definitions
// ---------------------------------------------------------------------------

interface AgentDef {
  id: string;
  label: string;
  domain: DomainId;
  icon: string;
  level: number;
  xp: number;
  queue: string[];
  metric: string;
}

const AGENT_DEFS: AgentDef[] = [
  {
    id: "agent-concierge",
    label: "Concierge",
    domain: "ops",
    icon: "Bot",
    level: 38,
    xp: 87,
    queue: [
      "Route inbound chat from Kowloon Physio",
      "Qualify new inquiry - Harbour Dental",
      "Update intake form responses",
    ],
    metric: "4,201 handled",
  },
  {
    id: "agent-leadgen",
    label: "Lead Gen Engine",
    domain: "leadgen",
    icon: "Target",
    level: 35,
    xp: 61,
    queue: [
      "Scrape 47 Industries LinkedIn",
      "Score 12 new contacts from ad click",
      "Sync leads to pipeline",
      "Flag hot leads for outreach",
    ],
    metric: "3,712 leads",
  },
  {
    id: "agent-outreach",
    label: "Outreach Bot",
    domain: "outreach",
    icon: "Send",
    level: 29,
    xp: 44,
    queue: [
      "Send sequence step 3 to Wells Landscaping",
      "Draft cold intro for North Shore Smoke Shop",
      "Pause sequence - no reply 7d",
    ],
    metric: "18,430 sent",
  },
  {
    id: "agent-nurture",
    label: "Nurture",
    domain: "followups",
    icon: "Repeat",
    level: 22,
    xp: 78,
    queue: [
      "Send day-5 follow-up to Conscious Soul Skin",
      "Re-engage cold leads from March",
      "Log reply from Harbour Dental",
    ],
    metric: "2,890 nurtured",
  },
  {
    id: "agent-adengine",
    label: "Ad Engine",
    domain: "leadgen",
    icon: "TrendingUp",
    level: 31,
    xp: 55,
    queue: [
      "Refresh creatives for Meta campaign",
      "Pause underperforming ad sets",
      "Build lookalike from recent converters",
      "Budget reallocation review",
    ],
    metric: "HK$41,200 ROAS",
  },
  {
    id: "agent-voice",
    label: "Voice Receptionist",
    domain: "ops",
    icon: "PhoneCall",
    level: 18,
    xp: 33,
    queue: [
      "Answer missed call from Kowloon Physio patient",
      "Log voicemail summary",
      "Schedule callback for tomorrow 10am",
    ],
    metric: "842 calls",
  },
  {
    id: "agent-inbox",
    label: "Inbox Manager",
    domain: "engagement",
    icon: "Inbox",
    level: 26,
    xp: 70,
    queue: [
      "Triage 14 new messages",
      "Flag urgent DM from Landmark Wellness",
      "Auto-reply to FAQ threads",
      "Archive resolved conversations",
    ],
    metric: "99.1% replied",
  },
  {
    id: "agent-content",
    label: "Content Studio",
    domain: "content",
    icon: "PenTool",
    level: 24,
    xp: 48,
    queue: [
      "Draft IG carousel for 47 Industries",
      "Write LinkedIn post for Harbour Dental",
      "Schedule 3 posts for next week",
    ],
    metric: "310 assets",
  },
  {
    id: "agent-dm",
    label: "DM Operator",
    domain: "outreach",
    icon: "MessageSquare",
    level: 20,
    xp: 62,
    queue: [
      "Send IG DM sequence step 2 to Sai Ying Pun Spa",
      "Reply to Conscious Soul Skin inquiry",
      "Follow up with Gem & Co",
    ],
    metric: "6,104 DMs",
  },
  {
    id: "agent-comment",
    label: "Comment Engagement",
    domain: "engagement",
    icon: "MessagesSquare",
    level: 16,
    xp: 29,
    queue: [
      "Reply to 8 new comments on last post",
      "Like and respond to story mentions",
      "Flag negative comment for review",
    ],
    metric: "14,822 engaged",
  },
  {
    id: "agent-recovery",
    label: "Recovery Engine",
    domain: "recovery",
    icon: "LifeBuoy",
    level: 27,
    xp: 91,
    queue: [
      "Re-engage Wells Landscaping - 30d silent",
      "Send win-back offer to churned client",
      "Update recovery status report",
    ],
    metric: "HK$128k recovered",
  },
  {
    id: "agent-pipeline",
    label: "Pipeline Router",
    domain: "pipeline",
    icon: "GitBranch",
    level: 33,
    xp: 57,
    queue: [
      "Advance Harbour Dental to proposal stage",
      "Move 3 stale deals to nurture",
      "Send stage-change notification",
      "Update deal value estimates",
    ],
    metric: "HK$2.1M pipeline",
  },
  {
    id: "agent-datasync",
    label: "Data Sync",
    domain: "data",
    icon: "Database",
    level: 21,
    xp: 40,
    queue: [
      "Sync CRM contacts from last 24h",
      "Reconcile duplicate records",
      "Export weekly report",
    ],
    metric: "99.7% sync rate",
  },
  {
    id: "agent-automation",
    label: "Automation Hub",
    domain: "automation",
    icon: "Zap",
    level: 36,
    xp: 74,
    queue: [
      "Trigger onboarding workflow for new client",
      "Run invoice automation for Finance",
      "Retry failed webhook - North Shore Smoke Shop",
      "Schedule next week task batch",
    ],
    metric: "72,140 tasks run",
  },
];

// ---------------------------------------------------------------------------
// Client definitions
// ---------------------------------------------------------------------------

interface ClientDef {
  id: string;
  label: string;
  domain: DomainId;
  agentId: string;
  icon: string;
  level: number;
  xp: number;
  queue: string[];
  metric: string;
}

const CLIENT_DEFS: ClientDef[] = [
  // leadgen
  {
    id: "cli-01", label: "North Shore Smoke Shop", domain: "leadgen", agentId: "agent-leadgen",
    icon: "Store", level: 4, xp: 30, queue: ["Qualify 5 new clicks", "Send intro sequence"], metric: "HK$4,200/mo",
  },
  {
    id: "cli-02", label: "47 Industries", domain: "leadgen", agentId: "agent-adengine",
    icon: "Building2", level: 8, xp: 65, queue: ["Review ad performance", "Approve lookalike"], metric: "HK$12,800/mo",
  },
  {
    id: "cli-03", label: "Tsim Sha Tsui Auto", domain: "leadgen", agentId: "agent-adengine",
    icon: "Car", level: 5, xp: 45, queue: ["Boost weekend ad spend", "A/B test copy"], metric: "HK$7,600/mo",
  },
  // outreach
  {
    id: "cli-04", label: "Conscious Soul Skin", domain: "outreach", agentId: "agent-outreach",
    icon: "Sparkles", level: 6, xp: 58, queue: ["Resume paused sequence", "Log reply"], metric: "HK$5,800/mo",
  },
  {
    id: "cli-05", label: "Sai Ying Pun Spa", domain: "outreach", agentId: "agent-dm",
    icon: "Leaf", level: 3, xp: 20, queue: ["Send DM step 3", "Update status"], metric: "HK$3,400/mo",
  },
  {
    id: "cli-06", label: "Causeway Bay Threads", domain: "outreach", agentId: "agent-outreach",
    icon: "Scissors", level: 5, xp: 38, queue: ["Draft intro email", "Enrich contact data"], metric: "HK$4,900/mo",
  },
  {
    id: "cli-07", label: "Yau Ma Tei Print", domain: "outreach", agentId: "agent-dm",
    icon: "FileText", level: 2, xp: 15, queue: ["Send cold DM", "Track open"], metric: "HK$2,100/mo",
  },
  // pipeline
  {
    id: "cli-08", label: "Harbour Dental", domain: "pipeline", agentId: "agent-pipeline",
    icon: "Stethoscope", level: 9, xp: 72, queue: ["Advance to proposal", "Send pricing deck"], metric: "HK$18,000/mo",
  },
  {
    id: "cli-09", label: "Landmark Wellness", domain: "pipeline", agentId: "agent-pipeline",
    icon: "Heart", level: 7, xp: 60, queue: ["Follow up on proposal", "Schedule discovery call"], metric: "HK$9,400/mo",
  },
  {
    id: "cli-10", label: "Central Commerce Group", domain: "pipeline", agentId: "agent-pipeline",
    icon: "Landmark", level: 11, xp: 88, queue: ["Sign contract", "Kick off onboarding"], metric: "HK$24,500/mo",
  },
  // engagement
  {
    id: "cli-11", label: "Kowloon Physio", domain: "engagement", agentId: "agent-inbox",
    icon: "Dumbbell", level: 6, xp: 50, queue: ["Reply to 3 DMs", "Update FAQ auto-reply"], metric: "HK$6,200/mo",
  },
  {
    id: "cli-12", label: "Mong Kok Grooming", domain: "engagement", agentId: "agent-comment",
    icon: "Scissors", level: 4, xp: 35, queue: ["Reply to 5 comments", "Like story mentions"], metric: "HK$3,800/mo",
  },
  {
    id: "cli-13", label: "Gem & Co Jewellers", domain: "engagement", agentId: "agent-inbox",
    icon: "Gem", level: 8, xp: 68, queue: ["Handle inquiry thread", "Archive resolved"], metric: "HK$11,200/mo",
  },
  {
    id: "cli-14", label: "Sheung Wan Records", domain: "engagement", agentId: "agent-comment",
    icon: "Music", level: 3, xp: 22, queue: ["Engage new follower comments", "Post reply"], metric: "HK$2,900/mo",
  },
  // followups
  {
    id: "cli-15", label: "Wells Landscaping", domain: "followups", agentId: "agent-nurture",
    icon: "Leaf", level: 5, xp: 42, queue: ["Send day-5 follow-up", "Log status"], metric: "HK$5,100/mo",
  },
  {
    id: "cli-16", label: "Tin Hau Home Decor", domain: "followups", agentId: "agent-nurture",
    icon: "Home", level: 4, xp: 30, queue: ["Re-engage 15d silent lead", "Update sequence"], metric: "HK$3,600/mo",
  },
  {
    id: "cli-17", label: "Sha Tin Pet Care", domain: "followups", agentId: "agent-nurture",
    icon: "Heart", level: 3, xp: 18, queue: ["Send reminder email", "Check click tracking"], metric: "HK$2,800/mo",
  },
  // content
  {
    id: "cli-18", label: "Kennedy Town Cafe", domain: "content", agentId: "agent-content",
    icon: "Coffee", level: 6, xp: 54, queue: ["Draft IG reel caption", "Schedule 3 posts"], metric: "HK$4,800/mo",
  },
  {
    id: "cli-19", label: "Wan Chai Photo Studio", domain: "content", agentId: "agent-content",
    icon: "Camera", level: 5, xp: 40, queue: ["Create carousel content", "Write blog post"], metric: "HK$5,600/mo",
  },
  {
    id: "cli-20", label: "Happy Valley Fitness", domain: "content", agentId: "agent-content",
    icon: "Dumbbell", level: 7, xp: 66, queue: ["Produce 2 reels", "Caption workout series"], metric: "HK$7,200/mo",
  },
  // systems
  {
    id: "cli-21", label: "Pacific Tech Solutions", domain: "systems", agentId: "agent-concierge",
    icon: "Monitor", level: 9, xp: 80, queue: ["Onboard new team seat", "Config integrations"], metric: "HK$16,400/mo",
  },
  {
    id: "cli-22", label: "HK Cloud Partners", domain: "systems", agentId: "agent-concierge",
    icon: "Network", level: 7, xp: 55, queue: ["Review system health", "Update API keys"], metric: "HK$10,800/mo",
  },
  // finance
  {
    id: "cli-23", label: "Aberdeen Accounting", domain: "finance", agentId: "agent-automation",
    icon: "Briefcase", level: 8, xp: 70, queue: ["Run invoice automation", "Send payment reminder"], metric: "HK$13,200/mo",
  },
  {
    id: "cli-24", label: "Pok Fu Lam Realty", domain: "finance", agentId: "agent-automation",
    icon: "Building", level: 6, xp: 48, queue: ["Process retainer payment", "Update billing records"], metric: "HK$8,600/mo",
  },
  {
    id: "cli-25", label: "Stanley Investment Group", domain: "finance", agentId: "agent-automation",
    icon: "TrendingUp", level: 10, xp: 92, queue: ["Automate monthly reporting", "Flag overdue invoices"], metric: "HK$22,000/mo",
  },
  // ops
  {
    id: "cli-26", label: "Kwun Tong Logistics", domain: "ops", agentId: "agent-voice",
    icon: "Truck", level: 5, xp: 38, queue: ["Route 2 inbound calls", "Log missed call"], metric: "HK$6,000/mo",
  },
  {
    id: "cli-27", label: "Tuen Mun Hotel", domain: "ops", agentId: "agent-voice",
    icon: "Hotel", level: 6, xp: 52, queue: ["Handle booking inquiry call", "Update guest record"], metric: "HK$7,800/mo",
  },
  // recovery
  {
    id: "cli-28", label: "Tai Wai Auto Parts", domain: "recovery", agentId: "agent-recovery",
    icon: "Wrench", level: 4, xp: 28, queue: ["Send win-back offer", "Log last touch date"], metric: "HK$3,200/mo",
  },
  {
    id: "cli-29", label: "Lai Chi Kok Bakery", domain: "recovery", agentId: "agent-recovery",
    icon: "ChefHat", level: 3, xp: 20, queue: ["Re-engage 45d silent", "Send reactivation SMS"], metric: "HK$2,400/mo",
  },
  {
    id: "cli-30", label: "Sham Shui Po Gadgets", domain: "recovery", agentId: "agent-recovery",
    icon: "Package", level: 5, xp: 44, queue: ["Offer upgrade discount", "Track email open"], metric: "HK$4,600/mo",
  },
  // data
  {
    id: "cli-31", label: "Admiralty Analytics", domain: "data", agentId: "agent-datasync",
    icon: "BarChart3", level: 7, xp: 62, queue: ["Sync 24h contact updates", "Export weekly CSV"], metric: "HK$9,800/mo",
  },
  {
    id: "cli-32", label: "Sai Kung Research Lab", domain: "data", agentId: "agent-datasync",
    icon: "Search", level: 5, xp: 44, queue: ["Reconcile duplicate leads", "Tag contact segments"], metric: "HK$6,400/mo",
  },
  // automation
  {
    id: "cli-33", label: "Yuen Long Smart Home", domain: "automation", agentId: "agent-automation",
    icon: "Zap", level: 6, xp: 56, queue: ["Trigger onboarding flow", "Monitor webhook health"], metric: "HK$7,400/mo",
  },
  {
    id: "cli-34", label: "Fo Tan Digital Studio", domain: "automation", agentId: "agent-automation",
    icon: "Radio", level: 4, xp: 32, queue: ["Run weekly task batch", "Retry failed step 3"], metric: "HK$4,200/mo",
  },
  {
    id: "cli-35", label: "Repulse Bay Spa", domain: "engagement", agentId: "agent-inbox",
    icon: "Flower", level: 5, xp: 46, queue: ["Reply to 4 new DMs", "Update booking link"], metric: "HK$5,400/mo",
  },
  {
    id: "cli-36", label: "Cheung Sha Wan Textiles", domain: "outreach", agentId: "agent-outreach",
    icon: "Package", level: 3, xp: 24, queue: ["Draft intro sequence", "Verify contact email"], metric: "HK$2,600/mo",
  },
];

// ---------------------------------------------------------------------------
// buildGraph
// ---------------------------------------------------------------------------

export function buildGraph(): { nodes: GraphNode[]; links: Link[] } {
  const nodes: GraphNode[] = [];
  const links: Link[] = [];

  // 1. Core node
  nodes.push({
    id: "core",
    kind: "core",
    label: "Intelbase Core",
    domain: "systems",
    icon: "BrainCircuit",
    pos: { x: 0, y: 0, z: 0 },
    level: 99,
    xp: 100,
    status: "active",
    queue: [
      "Coordinating 14 active agents",
      "Processing 312 live tasks",
      "Running health checks across all domains",
    ],
    metric: "HK$528k MRR",
    series: risingSeries(0, 12, 420000, 528000),
  });

  // 2. Agent nodes on inner shell radius ~0.45
  const AGENT_RADIUS = 0.45;
  AGENT_DEFS.forEach((def, i) => {
    const unit = fibSphere(i, AGENT_DEFS.length);
    const seed = i * 17 + 3;
    nodes.push({
      id: def.id,
      kind: "agent",
      label: def.label,
      domain: def.domain,
      icon: def.icon,
      pos: {
        x: unit.x * AGENT_RADIUS,
        y: unit.y * AGENT_RADIUS,
        z: unit.z * AGENT_RADIUS,
      },
      level: def.level,
      xp: def.xp,
      status: pickStatus(seed),
      queue: def.queue,
      metric: def.metric,
      series: risingSeries(seed, 12, def.level * 100, def.level * 100 + def.xp * 12),
    });
    links.push({ from: def.id, to: "core" });
  });

  // Build a quick lookup for agent positions (for client clustering)
  const agentPosMap: Record<string, { x: number; y: number; z: number }> = {};
  for (const n of nodes) {
    if (n.kind === "agent") agentPosMap[n.id] = n.pos;
  }

  // 3. Client nodes on outer shells radius ~0.8-1.15
  CLIENT_DEFS.forEach((def, i) => {
    const unit = fibSphere(i, CLIENT_DEFS.length);
    const seed = i * 31 + 7;

    // Base radius varies by index for depth variety
    const baseRadius = 0.8 + (seededRand(seed) * 0.35);

    // Nudge toward the serving agent
    const agentPos = agentPosMap[def.agentId];
    const nudge = 0.15;
    const raw = {
      x: unit.x * baseRadius + (agentPos ? agentPos.x * nudge : 0),
      y: unit.y * baseRadius + (agentPos ? agentPos.y * nudge : 0),
      z: unit.z * baseRadius + (agentPos ? agentPos.z * nudge : 0),
    };

    // Clamp to [-1.2, 1.2]
    const clamp = (v: number) => Math.max(-1.2, Math.min(1.2, v));

    nodes.push({
      id: def.id,
      kind: "client",
      label: def.label,
      domain: def.domain,
      icon: def.icon,
      pos: {
        x: clamp(raw.x),
        y: clamp(raw.y),
        z: clamp(raw.z),
      },
      level: def.level,
      xp: def.xp,
      status: pickStatus(seed + 100),
      queue: def.queue,
      metric: def.metric,
      series: risingSeries(seed, 12, def.level * 800, def.level * 800 + def.xp * 50),
    });

    links.push({ from: def.id, to: def.agentId });
  });

  return { nodes, links };
}
