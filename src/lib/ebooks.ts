export type Ebook = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  priceUsd: number;
  priceId?: string;
  pages: number;
  accent: "blue" | "violet" | "emerald";
};

export const EBOOKS: Ebook[] = [
  {
    slug: "social-ads-playbook",
    title: "The AI Social Media & Ads Playbook",
    subtitle: "OpenClaw · Higgsfield · claude-ads",
    description:
      "The exact stack we use to automate an entire social channel — from content generation with Higgsfield and OpenClaw to running and auditing ad campaigns with the claude-ads skill.",
    bullets: [
      "Pipelines for daily content at zero marginal cost",
      "Prompt libraries for Higgsfield video + OpenClaw copy",
      "Run, audit, and optimize ads with /ads commands",
      "Full 250+ check audit methodology adapted for small teams",
      "Scripts, workflows, and n8n blueprints you can ship today",
    ],
    priceUsd: 49,
    priceId: process.env.STRIPE_PRICE_SOCIAL_ADS,
    pages: 62,
    accent: "blue",
  },
  {
    slug: "ai-automation-playbook",
    title: "The AI Automation Playbook",
    subtitle: "Shipping production automation with Claude Code",
    description:
      "A practitioner's guide to automating a real business with Claude Code — agents, sub-agents, skills, hooks, MCP, and the exact workflows we use to deliver in under an hour.",
    bullets: [
      "Claude Code fundamentals: agents, skills, hooks, MCP",
      "The 6-phase delivery loop we use for every client",
      "Sub-agent orchestration for research, code, review",
      "Reusable skills you can drop into any project today",
      "Real case studies with commit-level detail",
    ],
    priceUsd: 39,
    priceId: process.env.STRIPE_PRICE_AI_AUTOMATION,
    pages: 84,
    accent: "violet",
  },
  {
    slug: "website-builders-playbook",
    title: "The Website Builder's Playbook",
    subtitle: "21st.dev · Claude Code · ui-ux-pro-max · Vercel · Supabase",
    description:
      "Ship premium websites in hours, not weeks. The exact stack and workflow we use — plus a free, copy-paste prompt that automates cold outreach to local businesses offering them a free custom site to try.",
    bullets: [
      "Claude Code workflows for one-shot site builds",
      "Vercel deploys and Supabase backends in minutes",
      "The free outreach prompt we use to book meetings on autopilot",
      "A productised offer you can sell for $2–5k a build",
    ],
    priceUsd: 45,
    priceId: process.env.STRIPE_PRICE_WEBSITE_BUILDER,
    pages: 72,
    accent: "emerald",
  },
];

export function getEbook(slug: string): Ebook | undefined {
  return EBOOKS.find((e) => e.slug === slug);
}
