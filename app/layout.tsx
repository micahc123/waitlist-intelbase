import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intelbase — The AI Operating System for Business",
  description:
    "Intelbase is the all-in-one AI operating system that runs your business operations. Join the waitlist for early access.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
