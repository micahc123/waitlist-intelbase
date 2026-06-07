import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@/styles/tokens.css";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { ChatWidget } from "@/components/chat-widget";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://intelbase.studio";
const OG_TITLE = "intelbase. The Autonomous AI Operating System for Your Business.";
const OG_DESCRIPTION =
  "intelbase OS runs your front office and growth on autopilot: an AI that answers visitors, qualifies leads, books calls, nurtures follow-ups, and runs your ads, with guardrails. See it all on one dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "intelbase. The Autonomous AI Operating System for Your Business.",
  description: OG_DESCRIPTION,
  keywords: [
    "autonomous AI operating system",
    "AI for business",
    "AI lead generation",
    "AI website chatbot",
    "AI front office",
    "autonomous outbound",
    "AI ad automation",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "intelbase",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: "/intelbase-logo.png",
        width: 1200,
        height: 630,
        alt: "intelbase. The Autonomous AI Operating System for Your Business.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/intelbase-logo.png"],
  },
  verification: {
    other: {
      "facebook-domain-verification": "agiirshj5un6c8cddfagfn20q2kx3f",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <MetaPixel />
        {children}
        {/* AGENT-05: the dogfood demo, live site-wide. */}
        <ChatWidget />
      </body>
    </html>
  );
}
