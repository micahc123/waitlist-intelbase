export const AGENTS = [
  { id: "concierge", name: "Concierge", color: "#6ea8ff" },
  { id: "leadgen", name: "Lead Gen", color: "#7df5c8" },
  { id: "nurture", name: "Nurture", color: "#ffd166" },
  { id: "ads", name: "Ad Engine", color: "#ff8fb1" },
  { id: "control", name: "Control", color: "#b79cff" },
];

// Concierge conversation, revealed line-by-line off the clock.
export const CHAT = [
  { at: 8.0,  who: "visitor", text: "Hi, do you handle dental clinics in Hong Kong?" },
  { at: 9.5,  who: "ai",      text: "Yes. We run your front office end to end. Are you mostly losing leads after hours, or during the day?" },
  { at: 13.0, who: "visitor", text: "After hours mostly. Nobody answers the website at night." },
  { at: 15.0, who: "ai",      text: "That is exactly what the Concierge fixes. Roughly how many enquiries a week?" },
  { at: 18.0, who: "visitor", text: "Maybe 30 to 40." },
  { at: 20.0, who: "ai",      text: "Got it. You qualify as a strong fit. Want me to book a quick call?" },
  { at: 33.0, who: "visitor", text: "Sure, Friday afternoon works." },
  { at: 35.0, who: "ai",      text: "Booked for Friday 3:00pm. Confirmation is on the way." },
];

export const QUAL_TAGS = ["Dental", "Hong Kong", "After-hours gap", "30-40 leads/wk", "Strong fit"];

export interface Lead { id: string; name: string; value: string; stage: "new" | "qualified" | "booked" | "won"; hero?: boolean; }
export const LEADS: Lead[] = [
  { id: "l1", name: "Harbour Dental", value: "HK$48k", stage: "new", hero: true },
  { id: "l2", name: "Kowloon Physio", value: "HK$22k", stage: "qualified" },
  { id: "l3", name: "Central Law Co", value: "HK$60k", stage: "booked" },
  { id: "l4", name: "Sai Ying Pun Cafe", value: "HK$9k", stage: "qualified" },
  { id: "l5", name: "Tsim Sha Tsui Spa", value: "HK$31k", stage: "won" },
  { id: "l6", name: "Wanchai Realty", value: "HK$75k", stage: "new" },
];

export const SEQUENCES = [
  { id: "s1", name: "Welcome + qualify", steps: 4, active: 128, replies: 19 },
  { id: "s2", name: "Reactivation 90d", steps: 5, active: 64, replies: 11 },
  { id: "s3", name: "Post-call nurture", steps: 3, active: 41, replies: 7 },
];

export const CREATIVES = [
  { id: "c1", name: "After-hours hook", spendStart: 38, spendEnd: 61, roas: 4.2, winner: true },
  { id: "c2", name: "Speed-to-lead", spendStart: 34, spendEnd: 22, roas: 2.1 },
  { id: "c3", name: "Owner testimonial", spendStart: 28, spendEnd: 17, roas: 1.6 },
];

export const EXPANSION = [
  { name: "AI Voice Receptionist", on: true },
  { name: "AI Inbox Manager", on: true },
  { name: "Multilingual Front Desk", on: true },
  { name: "Quote & Proposal Builder", on: false },
  { name: "Reactivation Engine", on: true },
  { name: "Market & Competitor Watch", on: false },
];

export const KPIS = {
  answered: { label: "Visitors answered", base: 1180, end: 1206, unit: "" },
  qualified: { label: "Leads qualified", base: 84, end: 91, unit: "" },
  booked: { label: "Calls booked", base: 22, end: 26, unit: "" },
  roas: { label: "Blended ROAS", base: 3.1, end: 3.6, unit: "x" },
};
