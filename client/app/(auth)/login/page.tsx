"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi, saveTokens, decodeToken } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const setField = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      setApiError("");
    };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      // Call your real backend
      const response = await authApi.login({
        email: form.email,
        password: form.password,
      });

      // response = { accessToken, refreshToken }
      saveTokens(response.accessToken, response.refreshToken);

      // Decode the token to get user info
      const decoded = decodeToken(response.accessToken);
      setUser({
        id: decoded.id,
        department_id: decoded.department_id ?? null,
        name: decoded.name,
        email: decoded.email,
        phone: decoded.phone,
      });

      // If user has no department yet, go to onboarding
      if (!decoded.department_id) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md" style={{ animation: "fadeUp 0.4s ease both" }}>
      <div className="flex justify-center mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to your AssetFlow account to continue.
        </p>
      </div>

      {apiError && (
        <div className="mb-5 p-3 rounded-md text-sm bg-red-500/10
                        border border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="email" label="Email address" type="email"
          placeholder="you@strathmore.edu"
          value={form.email} onChange={setField("email")}
          error={errors.email} required
        />
        <div className="flex flex-col gap-1.5">
          <Input
            id="password" label="Password" type="password"
            placeholder="Enter your password"
            value={form.password} onChange={setField("password")}
            error={errors.password} required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/7" />
        <span className="text-xs text-slate-500">or</span>
        <div className="flex-1 h-px bg-white/7" />
      </div>

      <div className="p-4 rounded-md bg-indigo-500/5 border border-indigo-500/10
                      text-sm text-slate-400 leading-relaxed">
        <span className="font-medium text-slate-200">New to AssetFlow?</span>{" "}
        Ask your department manager for an invite, or{" "}
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