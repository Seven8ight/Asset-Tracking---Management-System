"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

// The roles a user can sign up as
const ROLES = [
  { value: "asset_manager", label: "Asset Manager", desc: "Create and manage a department" },
  { value: "support_staff", label: "Support Staff", desc: "View and use assets in your department" },
  { value: "maintenance", label: "Maintenance Engineer", desc: "Manage repairs and asset status" },
];

// Password strength checker
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
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2">
      {/* Bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 rounded-full transition-all duration-200
              ${i < score ? colors[score - 1] : "bg-white/10"}`}
          />
        ))}
      </div>
      {/* Check labels */}
      <div className="flex gap-3 mt-1.5">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-xs ${c.pass ? "text-emerald-400" : "text-slate-600"}`}
          >
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  // Step 1 = account details, step 2 = role selection
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    inviteCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Validate only step 1 fields
  const validateStep1 = () => {
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

  // Validate only step 2 fields
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.role) errs.role = "Please select a role";
    if (form.role !== "asset_manager" && !form.inviteCode.trim())
      errs.inviteCode = "Invite code is required for this role";
    return errs;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setAlert({ type: "success", message: "Account created! Redirecting…" });
  };

  return (
    <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>

      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <StepDot number={1} active={step >= 1} done={step > 1} label="Account" />
        <div className={`flex-1 h-px transition-colors duration-300 
          ${step > 1 ? "bg-indigo-500" : "bg-white/10"}`} />
        <StepDot number={2} active={step >= 2} done={false} label="Role" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
          {step === 1 ? "Create your account" : "Choose your role"}
        </h1>
        <p className="text-sm text-slate-400">
          {step === 1
            ? "Set up your AssetFlow credentials."
            : "Select your role. You'll need an invite code from your department manager."}
        </p>
      </div>

      {alert && (
        <div className="mb-5 p-3 rounded-md text-sm bg-emerald-500/10 
                        border border-emerald-500/20 text-emerald-300">
          {alert.message}
        </div>
      )}

      {/* Step 1 form */}
      {step === 1 && (
        <form onSubmit={handleNext} className="flex flex-col gap-5">
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
          <Button type="submit" fullWidth>Continue</Button>
        </form>
      )}

      {/* Step 2 form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Role selector — a custom dropdown built with buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Role <span className="text-indigo-400">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, role: r.value }));
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  className={`p-3 rounded-md border text-left transition-all
                    ${form.role === r.value
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/7 hover:border-white/15"
                    }`}
                >
                  <div className={`text-sm font-medium 
                    ${form.role === r.value ? "text-indigo-300" : "text-slate-200"}`}>
                    {r.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
            {errors.role && (
              <span className="text-xs text-red-400">{errors.role}</span>
            )}
          </div>

          {/* Invite code — only shown when a non-manager role is selected */}
          {form.role && form.role !== "asset_manager" && (
            <Input
              id="inviteCode" label="Invite code"
              placeholder="Paste your invite code"
              value={form.inviteCode} onChange={setField("inviteCode")}
              error={errors.inviteCode}
              hint="Your department manager sent this to you."
              required
            />
          )}

          {form.role === "asset_manager" && (
            <div className="p-3 rounded-md bg-indigo-500/5 border border-indigo-500/10 
                            text-sm text-slate-400">
              As an <span className="text-slate-200 font-medium">Asset Manager</span>, 
              you can create your department after signing up.
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep(1); setErrors({}); }}>
              Back
            </Button>
            <Button type="submit" fullWidth loading={loading}>
              Create account
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 font-medium hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}

// Small numbered circle for the step indicator
function StepDot({ number, active, done, label }: {
  number: number; active: boolean; done: boolean; label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center
                       text-xs font-bold transition-all duration-200
        ${active
          ? done
            ? "bg-emerald-500 text-white"
            : "bg-indigo-500 text-white"
          : "bg-white/10 text-slate-500"
        }`}>
        {done ? "✓" : number}
      </div>
      <span className={`text-xs ${active ? "text-slate-300" : "text-slate-600"}`}>
        {label}
      </span>
    </div>
  );
}