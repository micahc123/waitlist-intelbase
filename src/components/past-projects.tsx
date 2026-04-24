"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Lock, ArrowUpRight, MapPin } from "lucide-react";

type Project = {
  role: string;
  location: string;
  problem: string;
  built: string;
  tint: string;
};

const projects: Project[] = [
  {
    role: "SaaS startup", location: "Austin, TX",
    problem: "Manually routing 500+ leads/week across 3 sales reps with no CRM sync",
    built: "n8n lead router that auto-assigns leads and syncs activity to HubSpot in real time",
    tint: "from-blue-500/30 to-indigo-600/20",
  },
  {
    role: "Fintech company", location: "New York, NY",
    problem: "Compliance reporting took 40+ hrs/month across multiple data sources",
    built: "Automated compliance pipeline with real-time audit trail generation",
    tint: "from-emerald-500/30 to-teal-600/20",
  },
  {
    role: "Marketing agency", location: "London, UK",
    problem: "Cold outreach replies were going unread — no system to handle responses at scale",
    built: "AI reply agent that reads, categorizes, and responds to cold email replies 24/7",
    tint: "from-amber-500/30 to-orange-600/20",
  },
  {
    role: "Biotech lab", location: "Boston, MA",
    problem: "Researchers couldn't quickly search 10k+ internal papers and trial results",
    built: "RAG system over entire research corpus with semantic search and citation linking",
    tint: "from-violet-500/30 to-purple-600/20",
  },
  {
    role: "3PL logistics operator", location: "Dallas, TX",
    problem: "Dispatchers spent 6+ hrs/day manually assigning shipments to carriers",
    built: "AI dispatcher that auto-assigns shipments and notifies drivers via Twilio SMS",
    tint: "from-rose-500/30 to-pink-600/20",
  },
  {
    role: "Media production company", location: "Los Angeles, CA",
    problem: "Ad creative was bottlenecked on manual video production — weeks per campaign",
    built: "Video pipeline that generates, reviews, and publishes ad creatives automatically",
    tint: "from-cyan-500/30 to-blue-600/20",
  },
  {
    role: "Hedge fund", location: "Singapore",
    problem: "Deal intake was scattered across email, PDFs, and spreadsheets",
    built: "Structured deal-flow intake bot with automatic tagging and analyst routing",
    tint: "from-slate-500/30 to-neutral-600/20",
  },
  {
    role: "Law firm", location: "Chicago, IL",
    problem: "Associates spent hours manually reviewing contracts for risk clauses",
    built: "Document review agent that flags risk clauses and generates redline summaries",
    tint: "from-emerald-600/30 to-green-600/20",
  },
  {
    role: "Health clinic network", location: "Miami, FL",
    problem: "Patient intake forms took 20+ min per patient and created data silos",
    built: "Automated intake system with EHR sync and insurance pre-check",
    tint: "from-teal-500/30 to-cyan-600/20",
  },
  {
    role: "E-commerce brand", location: "Seattle, WA",
    problem: "Stock-outs were costing $30k+/month — no system to trigger reorders automatically",
    built: "Inventory reorder agent that monitors stock levels and auto-places supplier orders via Shopify",
    tint: "from-fuchsia-500/30 to-pink-600/20",
  },
  {
    role: "Creative studio", location: "Toronto, ON",
    problem: "Content scheduling was done manually — teams missing posting windows daily",
    built: "Content scheduler and AI copy assistant that drafts and queues posts across channels",
    tint: "from-indigo-500/30 to-violet-600/20",
  },
  {
    role: "Hardware startup", location: "San Jose, CA",
    problem: "Support tickets were piling up — response time was 3+ days on average",
    built: "Ticket triage agent that classifies, prioritizes, and auto-resolves tier-1 issues",
    tint: "from-orange-500/30 to-red-600/20",
  },
  {
    role: "Real estate brokerage", location: "Phoenix, AZ",
    problem: "Leads from Zillow, Realtor, and web forms fell through the cracks with no follow-up",
    built: "Lead-to-tour pipeline that captures, nurtures, and books property viewings automatically",
    tint: "from-yellow-500/30 to-amber-600/20",
  },
  {
    role: "DTC wine brand", location: "Napa, CA",
    problem: "Monthly email campaigns were generic — no personalization by purchase history",
    built: "Personalized email agent that segments customers and writes tailored campaigns per cohort",
    tint: "from-rose-600/30 to-red-600/20",
  },
  {
    role: "Accounting firm", location: "Denver, CO",
    problem: "Clients sent documents in 10 different formats — intake took 2 hrs per client",
    built: "Universal document intake system with automatic classification and data extraction",
    tint: "from-sky-500/30 to-blue-600/20",
  },
  {
    role: "General contractor", location: "Nashville, TN",
    problem: "RFQ responses took 3–5 days — losing bids to faster competitors",
    built: "Auto-quoter that parses incoming RFQs and generates tailored proposals in minutes",
    tint: "from-stone-500/30 to-zinc-600/20",
  },
  {
    role: "Food & beverage distributor", location: "Miami, FL",
    problem: "Supplier outreach was fully manual — reps sent the same templated emails every day",
    built: "Supplier outreach bot that personalizes and sends follow-ups based on inventory signals",
    tint: "from-lime-500/30 to-green-600/20",
  },
  {
    role: "Government contractor", location: "Washington, D.C.",
    problem: "Manual data processing across dozens of agency systems causing reporting delays",
    built: "Automated cross-system data aggregation and compliance reporting pipeline",
    tint: "from-neutral-600/30 to-stone-700/20",
  },
  {
    role: "Freight brokerage", location: "Memphis, TN",
    problem: "Route planners spent hours manually optimizing loads with high deadhead miles",
    built: "Route optimization agent that auto-assigns loads to minimize empty miles",
    tint: "from-blue-600/30 to-cyan-600/20",
  },
  {
    role: "HR technology firm", location: "San Francisco, CA",
    problem: "Recruiters were reviewing 500+ applications per role manually each week",
    built: "Candidate screening agent that scores, filters, and schedules top applicants automatically",
    tint: "from-purple-500/30 to-fuchsia-600/20",
  },
  {
    role: "Private equity fund", location: "New York, NY",
    problem: "Analysts spent weeks manually processing data room documents for diligence",
    built: "Diligence copilot that extracts, summarizes, and cross-references data room documents",
    tint: "from-emerald-500/30 to-teal-700/20",
  },
  {
    role: "Travel concierge service", location: "Sydney, Australia",
    problem: "Itinerary creation took 4+ hrs per client — not scalable past 20 bookings/month",
    built: "AI itinerary generator that produces personalized travel plans in under 5 minutes",
    tint: "from-sky-400/30 to-indigo-500/20",
  },
  {
    role: "Indie game studio", location: "Vancouver, BC",
    problem: "Playtest feedback was scattered in Discord with no way to analyze patterns at scale",
    built: "Feedback loop that ingests Discord messages and surfaces recurring issues for the team",
    tint: "from-violet-600/30 to-purple-700/20",
  },
  {
    role: "Energy services company", location: "Houston, TX",
    problem: "Field reports were submitted in unstructured formats — analysts re-keyed data manually",
    built: "Field report parser that extracts structured data and populates dashboards automatically",
    tint: "from-green-500/30 to-emerald-600/20",
  },
  {
    role: "Insurance carrier", location: "Hartford, CT",
    problem: "Claims intake was a manual email process with an average processing time of 4 days",
    built: "Claims intake agent that parses submissions, validates coverage, and routes to adjusters",
    tint: "from-indigo-600/30 to-blue-700/20",
  },
  {
    role: "DTC skincare brand", location: "New York, NY",
    problem: "User-generated content was stuck in review forms — unusable without manual editing",
    built: "Review-to-UGC pipeline that turns raw customer reviews into polished video ads",
    tint: "from-pink-500/30 to-rose-600/20",
  },
  {
    role: "Business coaching firm", location: "Austin, TX",
    problem: "Sales team was spending 60% of their time on leads that never converted",
    built: "Lead qualification chatbot that scores and routes prospects before they reach sales",
    tint: "from-amber-500/30 to-yellow-600/20",
  },
  {
    role: "Pharma company", location: "New Jersey, NJ",
    problem: "Regulatory filing prep required pulling data from 15+ internal systems",
    built: "Regulatory assistant that aggregates source data and drafts submission-ready documents",
    tint: "from-cyan-600/30 to-blue-700/20",
  },
  {
    role: "Legal tech firm", location: "Washington, D.C.",
    problem: "Contract redlining required senior associates to go line-by-line for hours",
    built: "Contract redline agent that identifies deviations from standard terms and suggests edits",
    tint: "from-stone-600/30 to-neutral-700/20",
  },
  {
    role: "Full-service ad agency", location: "Chicago, IL",
    problem: "Ad ops team was manually managing campaigns, creative, and reporting across 12 clients",
    built: "End-to-end ad-ops autopilot that manages campaigns, generates creatives, and sends reports",
    tint: "from-green-500/30 to-teal-600/20",
  },
];

export function PastProjects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="work" className="relative px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div ref={ref} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">
            Recent Work
          </p>
          <h2 className="text-4xl font-medium tracking-tight text-white sm:text-5xl">
            30+ businesses, <span className="text-neutral-400">already shipped.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-neutral-400">
            All client details are kept confidential. Here&apos;s what industries we&apos;ve worked
            across and the problems we&apos;ve solved.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.5) }}
              className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0f12] p-5 transition-colors hover:border-white/[0.16]"
            >
              {/* Subtle tint strip at top */}
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${p.tint} opacity-60`} />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[10.5px] text-neutral-400">
                    {p.role}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <MapPin className="h-2.5 w-2.5 text-neutral-600" />
                    <span className="text-[10.5px] text-neutral-500">{p.location}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                    Wanted to automate
                  </p>
                  <p className="text-[13px] leading-snug text-neutral-400">
                    {p.problem}
                  </p>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                    What we built
                  </p>
                  <p className="text-[13px] font-medium leading-snug text-neutral-200">
                    {p.built}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Lock className="h-2.5 w-2.5 text-neutral-600" />
                  <span className="text-[10.5px] text-neutral-600">NDA — client details confidential</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <a
            href="https://cal.com/intelbase/discovery-call"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-black transition-all hover:bg-neutral-100"
          >
            Your business next
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <p className="text-[12px] text-neutral-500">
            30 recent builds across 20+ industries.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
