import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in - intelbase",
  description: "Sign in to your Intelbase OS.",
};

export default function LoginPage() {
  // AuthForm uses useSearchParams (next / error params), which requires a
  // Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
