import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MetaPixel } from "@/components/analytics/meta-pixel";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intelbase — Automate your entire business.",
  description:
    "Production-grade AI that actually runs your business. n8n workflows, custom agents, RAG over your data — built and shipped end-to-end. Not chatbots. Not demos.",
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
    <html lang="en" className={jakarta.variable}>
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
