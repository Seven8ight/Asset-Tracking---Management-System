"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../../components/ui/Logo";
import Button from "../../components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Department name is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // TODO: POST /api/departments → create department, assign current user as manager
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
      <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>

        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          {/* Step 1 done */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center
                            justify-center text-xs font-bold text-white">
              ✓
            </div>
            <span className="text-xs text-slate-500">Account</span>
          </div>
          <div className="flex-1 h-px bg-indigo-500" />
          {/* Step 2 active */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center
                            justify-center text-xs font-bold text-white">
              2
            </div>
            <span className="text-xs text-slate-300">Department</span>
          </div>
          <div className="flex-1 h-px bg-white/10" />
          {/* Step 3 pending */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center
                            justify-center text-xs font-bold text-slate-500">
              3
            </div>
            <span className="text-xs text-slate-600">Dashboard</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Create your first department
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Departments group your staff and assets together. You can create
            more departments from your dashboard later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Department name <span className="text-indigo-400">*</span>
            </label>
            <input
              placeholder="e.g. Facilities, IT Department"
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }));
                if (errors.name) setErrors((p) => ({ ...p, name: "" }));
              }}
              className={`px-3.5 py-2.5 rounded-lg bg-[#1E293B] text-sm
                text-slate-200 placeholder:text-slate-600 outline-none
                border transition-all
                ${errors.name
                  ? "border-red-500/40 focus:border-red-400"
                  : "border-white/5 focus:border-indigo-500/50"
                }`}
            />
            {errors.name && (
              <span className="text-xs text-red-400">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Description{" "}
              <span className="text-slate-600 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="What does this department manage?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="px-3.5 py-2.5 rounded-lg bg-[#1E293B] border border-white/5
                         text-sm text-slate-200 placeholder:text-slate-600
                         outline-none focus:border-indigo-500/50 resize-none
                         transition-all"
            />
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create department and continue →
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          You can create more departments from your dashboard.
        </p>
      </div>
    </div>
  );
}