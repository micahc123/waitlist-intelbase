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
    title: "The Autonomous AI Ads Playbook",
    subtitle: "Run your ad engine on its own",
    description:
      "The exact approach we use to let an AI generate the creative and run the campaigns on its own, optimizing spend without a human babysitting every dollar.",
    bullets: [
      "An ad engine that generates creative and runs campaigns autonomously",
      "Test 30 to 50 variations a month where a human team runs a handful",
      "Move budget to what works automatically, with guardrails",
      "Wire the ad engine into the rest of your front office",
      "Workflows you can put live today",
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
      "A practitioner's guide to automating a real business with Claude Code: agents, sub-agents, skills, hooks, MCP, and the exact workflows we use to deliver in under an hour.",
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
      "Ship premium websites in hours, not weeks. The exact stack and workflow we use, plus a free copy-paste prompt that automates cold outreach to local businesses offering them a free custom site to try.",
    bullets: [
      "Claude Code workflows for one-shot site builds",
      "Vercel deploys and Supabase backends in minutes",
      "The free outreach prompt we use to book meetings on autopilot",
      "A productised offer you can sell for $2k to $5k a build",
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
