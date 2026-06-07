import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create your account - intelbase",
  description: "Start running your front office on autopilot with Intelbase OS.",
};

export default function SignupPage() {
  // AuthForm uses useSearchParams (next / error params), which requires a
  // Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
