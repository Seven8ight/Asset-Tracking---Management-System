"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  // Form state — holds the values of each input
  const [form, setForm] = useState({ email: "", password: "" });
  // Error state — holds validation messages per field
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Loading state — true while waiting for API response
  const [loading, setLoading] = useState(false);
  // Alert state — success or error message shown at top of form
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Helper: update one field in the form without losing the others
  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear the error for this field as the user types
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Check the form before submitting
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // stop browser from refreshing the page

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setAlert(null);

    // TODO: replace this with your real API call
    await new Promise((r) => setTimeout(r, 1200));

    setLoading(false);
    setAlert({ type: "success", message: "Signed in! Redirecting…" });
  };

  return (
    <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>

      {/* Logo — only visible on mobile (panel hides on desktop) */}
      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to your AssetFlow account to continue.
        </p>
      </div>

      {/* Alert banner */}
      {alert && (
        <div className={`mb-5 p-3 rounded-md text-sm flex items-start gap-2
          ${alert.type === "error"
            ? "bg-red-500/10 border border-red-500/20 text-red-300"
            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@strathmore.edu"
          value={form.email}
          onChange={setField("email")}
          error={errors.email}
          required
        />

        <div className="flex flex-col gap-1.5">
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={setField("password")}
            error={errors.password}
            required
          />
          {/* Forgot password link sits under the password field */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/7" />
        <span className="text-xs text-slate-500">or</span>
        <div className="flex-1 h-px bg-white/7" />
      </div>

      {/* Info box for new users */}
      <div className="p-4 rounded-md bg-indigo-500/5 border border-indigo-500/10 
                      text-sm text-slate-400 leading-relaxed">
        <span className="font-medium text-slate-200">New to AssetFlow?</span>{" "}
        Ask your department manager for an invite link, or{" "}
        <Link href="/signup" className="text-indigo-400 font-medium hover:text-indigo-300">
          create an account
        </Link>{" "}
        to register your department.
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-indigo-400 font-medium hover:text-indigo-300">
          Get started
        </Link>
      </p>
    </div>
  );
}