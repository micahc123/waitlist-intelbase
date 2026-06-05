export type ServiceKey =
  | "concierge"
  | "leadgen"
  | "nurture"
  | "ads"
  | "dashboard";

export type Project = {
  role: string;
  location: string;
  problem: string;
  built: string;
  tint: string;
  service: ServiceKey;
};

export const projects: Project[] = [
  {
    role: "DTC skincare brand", location: "Austin, TX",
    problem: "Visitors landed at all hours but the team could only reply during the day, so leads went cold overnight",
    built: "AI website concierge that answers every visitor in seconds and books calls 24/7, with guardrails on what it can promise",
    tint: "from-pink-500/30 to-rose-600/20",
    service: "concierge",
  },
  {
    role: "B2B SaaS company", location: "San Francisco, CA",
    problem: "Founder-led sales meant outbound only happened when someone had a spare hour, which was rarely",
    built: "Autonomous lead generation that finds buyers and reaches out on its own, filling the calendar with qualified calls",
    tint: "from-blue-500/30 to-indigo-600/20",
    service: "leadgen",
  },
  {
    role: "Med spa", location: "Miami, FL",
    problem: "Leads came in but rarely got a follow-up before going cold, with no one to chase them",
    built: "Lead nurture on autopilot across email and SMS that qualifies and books consults until the lead books or opts out",
    tint: "from-teal-500/30 to-cyan-600/20",
    service: "nurture",
  },
  {
    role: "Boutique fitness studio", location: "Denver, CO",
    problem: "Inbound interest from ads but no system to answer questions and book a trial on the spot",
    built: "Website concierge that answers, qualifies, and books trials autonomously, handing off only when unsure",
    tint: "from-amber-500/30 to-orange-600/20",
    service: "concierge",
  },
  {
    role: "Roofing contractor", location: "Dallas, TX",
    problem: "Spending on Google but nothing structured running the ad creative or campaigns",
    built: "AI ad engine generating creative and running the campaigns, optimizing spend on its own",
    tint: "from-stone-500/30 to-zinc-600/20",
    service: "ads",
  },
  {
    role: "Online course creator", location: "Los Angeles, CA",
    problem: "No view of which step in the funnel was leaking, so decisions were guesswork",
    built: "One control dashboard showing conversations, qualified leads, booked calls, and ad performance in one place",
    tint: "from-violet-500/30 to-purple-600/20",
    service: "dashboard",
  },
  {
    role: "Dental practice group", location: "Phoenix, AZ",
    problem: "New patient leads sat in an inbox for days before anyone replied",
    built: "Autopilot nurture with instant follow-up, qualifying questions, and a self-serve booking link",
    tint: "from-sky-500/30 to-blue-600/20",
    service: "nurture",
  },
  {
    role: "E-commerce apparel brand", location: "New York, NY",
    problem: "Creative fatigue meant return on ad spend declined every month with too few new ads being tested",
    built: "AI ad engine generating 30 to 50 variations a month so winners rotate in before the old ones burn out",
    tint: "from-fuchsia-500/30 to-pink-600/20",
    service: "ads",
  },
  {
    role: "Real estate team", location: "Toronto, ON",
    problem: "No clear view of which conversations turned into booked calls and closed deals",
    built: "Control dashboard tracking the whole autonomous loop, from first chat to booked call to ROI",
    tint: "from-indigo-500/30 to-violet-600/20",
    service: "dashboard",
  },
  {
    role: "B2B marketing agency", location: "London, UK",
    problem: "Sales relied on the founder manually prospecting on LinkedIn with no consistency",
    built: "Autonomous lead generation working target lists and booking qualified calls without a sales hire",
    tint: "from-emerald-500/30 to-teal-600/20",
    service: "leadgen",
  },
  {
    role: "SaaS startup", location: "Seattle, WA",
    problem: "Conversation, lead, and ad data scattered across chat tools, a spreadsheet, and the CRM",
    built: "One dashboard for conversations, qualified leads, booked calls, and ad performance across the OS",
    tint: "from-cyan-500/30 to-blue-600/20",
    service: "dashboard",
  },
  {
    role: "Business coaching firm", location: "Austin, TX",
    problem: "Visitors had questions the site could not answer, so most left without booking",
    built: "Website concierge answering questions in the founder's voice and booking discovery calls around the clock",
    tint: "from-yellow-500/30 to-amber-600/20",
    service: "concierge",
  },
  {
    role: "Restaurant group", location: "Chicago, IL",
    problem: "Event and catering enquiries came in after hours and often went unanswered",
    built: "Concierge that answers enquiries instantly, qualifies them, and books the call, with strict guardrails on quotes",
    tint: "from-rose-600/30 to-red-600/20",
    service: "concierge",
  },
  {
    role: "Solar installer", location: "Houston, TX",
    problem: "Buying lead lists that mostly never answered the phone",
    built: "Autonomous lead generation feeding an autopilot nurture sequence, which replaced the bought leads",
    tint: "from-lime-500/30 to-green-600/20",
    service: "leadgen",
  },
  {
    role: "Boutique gym chain", location: "Sydney, Australia",
    problem: "Follow-up was inconsistent across locations and many trial requests went stale",
    built: "Autopilot nurture that follows up across channels until each lead books or opts out, per location",
    tint: "from-sky-400/30 to-indigo-500/20",
    service: "nurture",
  },
  {
    role: "Financial advisor", location: "Hartford, CT",
    problem: "Leads from webinars went cold with no structured follow-up",
    built: "Autopilot nurture wired into the CRM with a qualifying flow and a booking link",
    tint: "from-slate-500/30 to-neutral-600/20",
    service: "nurture",
  },
  {
    role: "DTC pet brand", location: "Vancouver, BC",
    problem: "Wanted the whole front office handled but could only afford one hire",
    built: "Full OS running concierge, lead gen, nurture, and ads, on one flat setup-plus-monthly quote",
    tint: "from-orange-500/30 to-red-600/20",
    service: "ads",
  },
  {
    role: "Home services franchise", location: "Nashville, TN",
    problem: "Each location ran its own tools with no shared view of leads or performance",
    built: "Central OS with per-location guardrails and one dashboard tracking every location's autonomous loop",
    tint: "from-green-500/30 to-emerald-600/20",
    service: "dashboard",
  },
];
