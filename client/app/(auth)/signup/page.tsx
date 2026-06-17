"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400"];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 h-0.5 rounded-full transition-all
            ${i < score ? colors[score - 1] : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex gap-3 mt-1.5">
        {checks.map((c) => (
          <span key={c.label}
            className={`text-xs ${c.pass ? "text-emerald-400" : "text-slate-600"}`}>
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // TODO: replace with real API call
    // POST /api/auth/signup → returns user with role: "asset_manager"
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    // After signup, asset manager must create their first department
    router.push("/onboarding");
  };

  return (
    <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>
      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
          Create your account
        </h1>
        <p className="text-sm text-slate-400">
          You&apos;ll be set up as an Asset Manager and can invite your team after.
        </p>
      </div>

      {alert && (
        <div className={`mb-5 p-3 rounded-md text-sm
          ${alert.type === "error"
            ? "bg-red-500/10 border border-red-500/20 text-red-300"
            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
          }`}>
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="name" label="Full name" placeholder="Jane Mwangi"
          value={form.name} onChange={setField("name")}
          error={errors.name} required
        />
        <Input
          id="email" label="Email address" type="email"
          placeholder="you@strathmore.edu"
          value={form.email} onChange={setField("email")}
          error={errors.email} required
        />
        <div>
          <Input
            id="password" label="Password" type="password"
            placeholder="Create a strong password"
            value={form.password} onChange={setField("password")}
            error={errors.password} required
          />
          <PasswordStrength password={form.password} />
        </div>
        <Input
          id="confirmPassword" label="Confirm password" type="password"
          placeholder="Repeat your password"
          value={form.confirmPassword} onChange={setField("confirmPassword")}
          error={errors.confirmPassword} required
        />

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}