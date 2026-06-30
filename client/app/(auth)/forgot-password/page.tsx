"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../../_lib/ui/Logo";
import Input from "../../_lib/ui/Input";
import Button from "../../_lib/ui/Button";
import { authApi } from "@/lib/api";

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email");
      return;
    }

    setLoading(true);
    setEmailError("");

    try {
      await authApi.resetPassword(email);
      setStep("sent");
    } catch (err) {
      setEmailError(
        (err as Error).message || "Failed to send reset link. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md"
      style={{ animation: "fadeUp 0.4s ease both" }}
    >
      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      {/* ── Step: Email ── */}
      {step === "email" && (
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 
                       hover:text-slate-300 mb-8 transition-colors"
          >
            ← Back to sign in
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            <Input
              id="reset-email"
              label="Email address"
              type="email"
              placeholder="you@strathmore.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={emailError}
              required
            />
            <Button type="submit" fullWidth loading={loading}>
              Send reset link
            </Button>
          </form>
        </div>
      )}

      {/* ── Step: Sent confirmation ── */}
      {step === "sent" && (
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 
                          border-emerald-500/30 flex items-center justify-center 
                          mx-auto mb-6"
          >
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-3">
            Check your email
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            If an account exists for{" "}
            <span className="text-slate-200 font-medium">{email}</span>,
            we&apos;ve sent a link to reset your password.
          </p>
          <Link href="/login">
            <Button variant="filled" fullWidth>
              Back to sign in
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
