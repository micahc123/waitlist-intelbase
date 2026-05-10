import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@/components/analytics/meta-pixel";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Intelbase — Fully Automate Your Entire Business",
  description:
    "We build production-ready AI infrastructure and offer done-for-you AI services — OpenClaw setups, n8n workflow automation, and multi-agent orchestration — so your AI actually works beyond the demo phase.",
  keywords: [
    "AI infrastructure",
    "AI agency",
    "FastAPI",
    "Supabase",
    "multi-agent orchestration",
    "AI backend",
    "OpenClaw",
    "n8n workflows",
    "AI services",
  ],
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
