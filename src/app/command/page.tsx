import type { Metadata } from "next";
import { CommandApp } from "@/components/command/command-app";

export const metadata: Metadata = {
  title: "Intelbase",
  robots: { index: false, follow: false }, // simulated command plane, keep out of search
};

export default function CommandPage() {
  return <CommandApp />;
}
