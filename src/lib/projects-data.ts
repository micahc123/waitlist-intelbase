export type ServiceKey =
  | "openclaw"
  | "automation"
  | "social-ads"
  | "n8n"
  | "llm-rag"
  | "custom-ai"
  | "claude";

export type Project = {
  role: string;
  location: string;
  problem: string;
  built: string;
  tint: string;
  service: ServiceKey;
};

export type ServiceDef = {
  key: ServiceKey;
  title: string;
  shortBody: string;
  longBody: string;
  tags: string[];
  emphasized?: boolean;
};

export const services: ServiceDef[] = [
  {
    key: "openclaw",
    title: "OpenClaw Full Setup",
    shortBody:
      "Full OpenClaw deployment on your Mac Mini, VPS, or any system — configured, integrated, and ready to go. Live in 30 minutes.",
    longBody:
      "OpenClaw is the backbone of your AI stack. We handle the full deployment — picking the right hardware or cloud setup, configuring models, connecting your tools, and making sure everything is production-ready before handing it off. Most setups are live within 30 minutes of starting. You get a fully running local AI system that you own entirely — no subscriptions, no rate limits, no data leaving your control. We then wire OpenClaw into your existing workflows so it's not just running, it's doing real work from day one.",
    tags: ["OpenClaw", "30 min setup", "Any system"],
    emphasized: true,
  },
  {
    key: "automation",
    title: "Business Automation",
    shortBody:
      "Lead capture, email sequences, CRM syncing, and cold email campaigns — the whole back-office running itself while you sleep.",
    longBody:
      "We map your entire operations workflow and identify every manual step that can be eliminated. From lead capture forms through to CRM enrichment, email follow-up sequences, appointment booking, and reporting — we build the full chain so your team stops doing repetitive work and starts doing only what requires human judgement. Every automation runs on your infrastructure, triggers in real time, and hands off to humans only when it genuinely needs to. The result is a back-office that runs 24/7 without additional headcount.",
    tags: ["Leads", "Email", "CRM", "Cold outreach"],
    emphasized: false,
  },
  {
    key: "social-ads",
    title: "Social Media & AI Ads",
    shortBody:
      "Content + ad generation with Higgsfield and OpenClaw. We build the full pipeline — scripting, visuals, posting, and paid ad campaigns on autopilot.",
    longBody:
      "From a single product brief, we build a pipeline that writes scripts, generates video content via Higgsfield, edits for platform specs, schedules posts, and manages paid ad spend. The system monitors performance and iterates creative automatically — so your content machine runs without a content team. Used by DTC brands, agencies, and media companies to scale output while cutting production costs. Most clients go from one piece of content per week to dozens, without hiring anyone.",
    tags: ["Higgsfield", "OpenClaw", "Ad campaigns"],
    emphasized: false,
  },
  {
    key: "n8n",
    title: "n8n Workflow Automation",
    shortBody:
      "Custom n8n workflows that automate your business processes — lead routing, data syncing, notifications, and AI-powered pipelines. Done in under an hour.",
    longBody:
      "n8n is the most powerful open-source automation platform available, and we've shipped hundreds of workflows across every industry. We design and deploy custom workflows for lead routing, cross-platform data sync, webhook handling, Slack/email notifications, AI enrichment nodes, and anything in between. Every workflow runs on your infrastructure — no per-task pricing, no vendor lock-in, no usage caps. Most builds are complete and tested within an hour. We also handle ongoing maintenance and iteration as your needs evolve.",
    tags: ["n8n", "Under 1 hour", "Automation"],
    emphasized: false,
  },
  {
    key: "llm-rag",
    title: "Custom LLM & RAG",
    shortBody:
      "Train a model on your business data. RAG pipelines that know your products, policies, and history — so your AI answers like it works there.",
    longBody:
      "We build retrieval-augmented generation systems that give your AI access to your actual knowledge — your docs, policies, product catalog, CRM history, emails, and more. Instead of a generic model that hallucinates, you get a system that answers from ground truth and cites its sources. We handle chunking strategy, embedding pipelines, vector database setup, retrieval tuning, and the full inference stack. Used by legal, biotech, finance, and ops-heavy businesses to replace hours of manual research with instant, accurate answers.",
    tags: ["RAG", "Fine-tune", "Vector DB"],
    emphasized: false,
  },
  {
    key: "custom-ai",
    title: "Custom AI Solutions",
    shortBody:
      "Anything outside the box — multi-agent systems, internal tools, workflow copilots. We scope it, build it, ship it.",
    longBody:
      "Some problems don't fit a template. We take on bespoke builds — multi-agent orchestration systems where multiple AI models collaborate on a task, internal copilots that sit inside your existing tools, decision-support systems, custom APIs, and hybrid human-in-the-loop workflows. If you can describe the problem, we can scope a solution. We've shipped for government contractors, private equity funds, and deep-tech startups where off-the-shelf tools simply don't exist or can't be trusted with sensitive data.",
    tags: ["Bespoke", "Multi-agent", "End-to-end"],
    emphasized: false,
  },
  {
    key: "claude",
    title: "Claude Systems & MCP",
    shortBody:
      "Claude Code setups, MCP server builds, and Claude-powered agents wired into your tools. From internal dev copilots to fully autonomous Claude pipelines.",
    longBody:
      "We build Claude-native infrastructure — MCP (Model Context Protocol) servers that give Claude direct access to your databases, APIs, and internal tools, Claude Code environments configured for your engineering team, and autonomous Claude agents that take actions across your stack without human prompting. If you want Claude to do more than answer questions — to actually operate inside your systems, read live data, and execute tasks — this is what we build. Every setup is fully auditable, with permission scopes and logging baked in.",
    tags: ["Claude Code", "MCP Servers", "Claude API", "Agents"],
    emphasized: false,
  },
];

export const projects: Project[] = [
  {
    role: "SaaS startup", location: "Austin, TX",
    problem: "Manually routing 500+ leads/week across 3 sales reps with no CRM sync",
    built: "n8n lead router that auto-assigns leads and syncs activity to HubSpot in real time",
    tint: "from-blue-500/30 to-indigo-600/20",
    service: "n8n",
  },
  {
    role: "Fintech company", location: "New York, NY",
    problem: "Compliance reporting took 40+ hrs/month across multiple data sources",
    built: "Automated compliance pipeline with real-time audit trail generation",
    tint: "from-emerald-500/30 to-teal-600/20",
    service: "automation",
  },
  {
    role: "Marketing agency", location: "London, UK",
    problem: "Cold outreach replies were going unread — no system to handle responses at scale",
    built: "AI reply agent that reads, categorizes, and responds to cold email replies 24/7",
    tint: "from-amber-500/30 to-orange-600/20",
    service: "openclaw",
  },
  {
    role: "Biotech lab", location: "Boston, MA",
    problem: "Researchers couldn't quickly search 10k+ internal papers and trial results",
    built: "RAG system over entire research corpus with semantic search and citation linking",
    tint: "from-violet-500/30 to-purple-600/20",
    service: "llm-rag",
  },
  {
    role: "3PL logistics operator", location: "Dallas, TX",
    problem: "Dispatchers spent 6+ hrs/day manually assigning shipments to carriers",
    built: "AI dispatcher that auto-assigns shipments and notifies drivers via Twilio SMS",
    tint: "from-rose-500/30 to-pink-600/20",
    service: "n8n",
  },
  {
    role: "Media production company", location: "Los Angeles, CA",
    problem: "Ad creative was bottlenecked on manual video production — weeks per campaign",
    built: "Video pipeline that generates, reviews, and publishes ad creatives automatically",
    tint: "from-cyan-500/30 to-blue-600/20",
    service: "social-ads",
  },
  {
    role: "Hedge fund", location: "Singapore",
    problem: "Deal intake was scattered across email, PDFs, and spreadsheets",
    built: "Structured deal-flow intake bot with automatic tagging and analyst routing",
    tint: "from-slate-500/30 to-neutral-600/20",
    service: "claude",
  },
  {
    role: "Law firm", location: "Chicago, IL",
    problem: "Associates spent hours manually reviewing contracts for risk clauses",
    built: "Document review agent that flags risk clauses and generates redline summaries",
    tint: "from-emerald-600/30 to-green-600/20",
    service: "llm-rag",
  },
  {
    role: "Health clinic network", location: "Miami, FL",
    problem: "Patient intake forms took 20+ min per patient and created data silos",
    built: "Automated intake system with EHR sync and insurance pre-check",
    tint: "from-teal-500/30 to-cyan-600/20",
    service: "automation",
  },
  {
    role: "E-commerce brand", location: "Seattle, WA",
    problem: "Stock-outs were costing $30k+/month — no system to trigger reorders automatically",
    built: "Inventory reorder agent that monitors stock levels and auto-places supplier orders via Shopify",
    tint: "from-fuchsia-500/30 to-pink-600/20",
    service: "n8n",
  },
  {
    role: "Creative studio", location: "Toronto, ON",
    problem: "Content scheduling was done manually — teams missing posting windows daily",
    built: "Content scheduler and AI copy assistant that drafts and queues posts across channels",
    tint: "from-indigo-500/30 to-violet-600/20",
    service: "social-ads",
  },
  {
    role: "Hardware startup", location: "San Jose, CA",
    problem: "Support tickets were piling up — response time was 3+ days on average",
    built: "Ticket triage agent that classifies, prioritizes, and auto-resolves tier-1 issues",
    tint: "from-orange-500/30 to-red-600/20",
    service: "claude",
  },
  {
    role: "Real estate brokerage", location: "Phoenix, AZ",
    problem: "Leads from Zillow, Realtor, and web forms fell through the cracks with no follow-up",
    built: "Lead-to-tour pipeline that captures, nurtures, and books property viewings automatically",
    tint: "from-yellow-500/30 to-amber-600/20",
    service: "n8n",
  },
  {
    role: "DTC wine brand", location: "Napa, CA",
    problem: "Monthly email campaigns were generic — no personalization by purchase history",
    built: "Personalized email agent that segments customers and writes tailored campaigns per cohort",
    tint: "from-rose-600/30 to-red-600/20",
    service: "openclaw",
  },
  {
    role: "Accounting firm", location: "Denver, CO",
    problem: "Clients sent documents in 10 different formats — intake took 2 hrs per client",
    built: "Universal document intake system with automatic classification and data extraction",
    tint: "from-sky-500/30 to-blue-600/20",
    service: "custom-ai",
  },
  {
    role: "General contractor", location: "Nashville, TN",
    problem: "RFQ responses took 3–5 days — losing bids to faster competitors",
    built: "Auto-quoter that parses incoming RFQs and generates tailored proposals in minutes",
    tint: "from-stone-500/30 to-zinc-600/20",
    service: "n8n",
  },
  {
    role: "Food & beverage distributor", location: "Miami, FL",
    problem: "Supplier outreach was fully manual — reps sent the same templated emails every day",
    built: "Supplier outreach bot that personalizes and sends follow-ups based on inventory signals",
    tint: "from-lime-500/30 to-green-600/20",
    service: "openclaw",
  },
  {
    role: "Government contractor", location: "Washington, D.C.",
    problem: "Manual data processing across dozens of agency systems causing reporting delays",
    built: "Automated cross-system data aggregation and compliance reporting pipeline",
    tint: "from-neutral-600/30 to-stone-700/20",
    service: "custom-ai",
  },
  {
    role: "Freight brokerage", location: "Memphis, TN",
    problem: "Route planners spent hours manually optimizing loads with high deadhead miles",
    built: "Route optimization agent that auto-assigns loads to minimize empty miles",
    tint: "from-blue-600/30 to-cyan-600/20",
    service: "n8n",
  },
  {
    role: "HR technology firm", location: "San Francisco, CA",
    problem: "Recruiters were reviewing 500+ applications per role manually each week",
    built: "Candidate screening agent that scores, filters, and schedules top applicants automatically",
    tint: "from-purple-500/30 to-fuchsia-600/20",
    service: "llm-rag",
  },
  {
    role: "Private equity fund", location: "New York, NY",
    problem: "Analysts spent weeks manually processing data room documents for diligence",
    built: "Diligence copilot that extracts, summarizes, and cross-references data room documents",
    tint: "from-emerald-500/30 to-teal-700/20",
    service: "llm-rag",
  },
  {
    role: "Travel concierge service", location: "Sydney, Australia",
    problem: "Itinerary creation took 4+ hrs per client — not scalable past 20 bookings/month",
    built: "AI itinerary generator that produces personalized travel plans in under 5 minutes",
    tint: "from-sky-400/30 to-indigo-500/20",
    service: "openclaw",
  },
  {
    role: "Indie game studio", location: "Vancouver, BC",
    problem: "Playtest feedback was scattered in Discord with no way to analyze patterns at scale",
    built: "Feedback loop that ingests Discord messages and surfaces recurring issues for the team",
    tint: "from-violet-600/30 to-purple-700/20",
    service: "n8n",
  },
  {
    role: "Energy services company", location: "Houston, TX",
    problem: "Field reports were submitted in unstructured formats — analysts re-keyed data manually",
    built: "Field report parser that extracts structured data and populates dashboards automatically",
    tint: "from-green-500/30 to-emerald-600/20",
    service: "custom-ai",
  },
  {
    role: "Insurance carrier", location: "Hartford, CT",
    problem: "Claims intake was a manual email process with an average processing time of 4 days",
    built: "Claims intake agent that parses submissions, validates coverage, and routes to adjusters",
    tint: "from-indigo-600/30 to-blue-700/20",
    service: "automation",
  },
  {
    role: "DTC skincare brand", location: "New York, NY",
    problem: "User-generated content was stuck in review forms — unusable without manual editing",
    built: "Review-to-UGC pipeline that turns raw customer reviews into polished video ads",
    tint: "from-pink-500/30 to-rose-600/20",
    service: "social-ads",
  },
  {
    role: "Business coaching firm", location: "Austin, TX",
    problem: "Sales team was spending 60% of their time on leads that never converted",
    built: "Lead qualification chatbot that scores and routes prospects before they reach sales",
    tint: "from-amber-500/30 to-yellow-600/20",
    service: "openclaw",
  },
  {
    role: "Pharma company", location: "New Jersey, NJ",
    problem: "Regulatory filing prep required pulling data from 15+ internal systems",
    built: "Regulatory assistant that aggregates source data and drafts submission-ready documents",
    tint: "from-cyan-600/30 to-blue-700/20",
    service: "llm-rag",
  },
  {
    role: "Legal tech firm", location: "Washington, D.C.",
    problem: "Contract redlining required senior associates to go line-by-line for hours",
    built: "Contract redline agent that identifies deviations from standard terms and suggests edits",
    tint: "from-stone-600/30 to-neutral-700/20",
    service: "claude",
  },
  {
    role: "Full-service ad agency", location: "Chicago, IL",
    problem: "Ad ops team was manually managing campaigns, creative, and reporting across 12 clients",
    built: "End-to-end ad-ops autopilot that manages campaigns, generates creatives, and sends reports",
    tint: "from-green-500/30 to-teal-600/20",
    service: "social-ads",
  },
];
