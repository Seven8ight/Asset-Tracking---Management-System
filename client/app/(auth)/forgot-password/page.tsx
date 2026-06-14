"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

type Step = "email" | "code" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Step 1 — send reset email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email"); return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("code");
  };

  // Step 2 — handle each digit box in the OTP input
  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only allow numbers
    const next = [...code];
    next[index] = value.slice(-1); // keep only the last digit typed
    setCode(next);
    setCodeError("");
    // Auto-move to next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    // On backspace in empty box, go to previous box
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join("").length < 6) { setCodeError("Enter the full 6-digit code"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // TODO: validate code against your API
    if (code.join("") !== "123456") {
      setCodeError("Invalid code. Try again."); return;
    }
    setStep("reset");
  };

  // Step 3 — set new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newPassword) errs.newPassword = "Password is required";
    else if (newPassword.length < 8) errs.newPassword = "Must be at least 8 characters";
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { setPassErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep("done");
  };

  return (
    <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>

      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      {/* ── Step: Email ── */}
      {step === "email" && (
        <div>
          <Link href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 
                       hover:text-slate-300 mb-8 transition-colors">
            ← Back to sign in
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Enter your email and we&apos;ll send you a reset code.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            <Input
              id="reset-email" label="Email address" type="email"
              placeholder="you@strathmore.edu"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              error={emailError} required
            />
            <Button type="submit" fullWidth loading={loading}>
              Send reset code
            </Button>
          </form>
        </div>
      )}

      {/* ── Step: OTP Code ── */}
      {step === "code" && (
        <div>
          <button onClick={() => setStep("email")}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 
                       hover:text-slate-300 mb-8 transition-colors bg-transparent border-none cursor-pointer">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Check your email
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            We sent a 6-digit code to{" "}
            <span className="text-slate-200 font-medium">{email}</span>.
          </p>
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-3">
                Verification code
              </label>
              {/* Six individual digit inputs */}
              <div className="flex gap-3 justify-center">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-md
                                bg-[var(--bg-input)] text-slate-100 outline-none
                                border transition-all duration-150
                                focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
                                ${codeError ? "border-red-500/40" : digit ? "border-indigo-500/40" : "border-white/7"}`}
                  />
                ))}
              </div>
              {codeError && (
                <p className="text-xs text-red-400 text-center mt-2">{codeError}</p>
              )}
              {/* Demo hint */}
              <p className="text-xs text-amber-400/70 text-center mt-3">
                Demo: use code <strong>123456</strong>
              </p>
            </div>
            <Button type="submit" fullWidth loading={loading}>
              Verify code
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setCode(["", "", "", "", "", ""])}
              className="text-indigo-400 font-medium hover:text-indigo-300 
                         bg-transparent border-none cursor-pointer text-sm"
            >
              Resend code
            </button>
          </p>
        </div>
      )}

      {/* ── Step: New Password ── */}
      {step === "reset" && (
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Set new password
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Choose a strong password for your account.
          </p>
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
            <Input
              id="new-password" label="New password" type="password"
              placeholder="Create a strong password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPassErrors({}); }}
              error={passErrors.newPassword} required
            />
            <Input
              id="confirm-password" label="Confirm new password" type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPassErrors({}); }}
              error={passErrors.confirmPassword} required
            />
            <Button type="submit" fullWidth loading={loading}>
              Reset password
            </Button>
          </form>
        </div>
      )}

      {/* ── Step: Done ── */}
      {step === "done" && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 
                          border-emerald-500/30 flex items-center justify-center 
                          mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-3">
            Password reset!
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            Your password has been updated. Sign in with your new credentials.
          </p>
          <Link href="/login">
            <Button variant="filled" fullWidth>Back to sign in</Button>
          </Link>
        </div>
      )}

    </div>
  );
}