import type { Metadata } from "next";
import "./globals.css";

const SITE_TITLE =
  "intelbase. The Autonomous AI Operating System for Your Business.";
const SITE_DESC =
  "intelbase OS runs your front office and growth on autopilot: an AI that answers visitors, qualifies leads, books calls, nurtures follow-ups, and runs your ads, with guardrails. Join the private beta waitlist.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: "intelbase",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
