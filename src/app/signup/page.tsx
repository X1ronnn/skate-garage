import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return <div className="px-4 py-16"><Suspense><AuthForm mode="signup" /></Suspense></div>;
}
