import type { Metadata } from "next";
import { OsApp } from "@/components/os/os-app";

export const metadata: Metadata = {
  title: "intelbase OS",
  robots: { index: false, follow: false }, // demo surface, keep out of search
};

export default function OsPage() {
  return <OsApp />;
}
