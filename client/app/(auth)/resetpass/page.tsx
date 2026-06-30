"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "../../_lib/ui/Logo";
import { authApi, saveTokens, userApi } from "@/lib/api";

type ApiResponse<T> = {
  response?: { message?: T };
};

type RefreshPayload = {
  accessToken: string;
};

export const ResetPassword = (): React.ReactNode => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrors({ submit: "Reset link is missing or invalid." });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const refreshResponse = (await authApi.refresh(
        token,
      )) as ApiResponse<RefreshPayload>;

      const refreshPayload = refreshResponse?.response?.message;
      const accessToken = refreshPayload?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Could not validate invite token. Please request a new invite.",
        );
      }

      await saveTokens(accessToken, token);

      (await userApi.update({
        password: password,
      })) as ApiResponse<unknown>;

      setSuccess(true);
    } catch (err) {
      setErrors({
        submit: (err as Error).message || "Failed to reset password",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="rounded-xl bg-[#1E293B] border border-white/5 p-6">
          {!token && (
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-lg font-semibold text-slate-100">
                Invalid reset link
              </h1>
              <p className="text-sm text-slate-400">
                This password reset link is missing or no longer valid. Request
                a new one to continue.
              </p>
              <Link
                href="/forgot-password"
                className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors"
              >
                Request a new link
              </Link>
            </div>
          )}

          {token && success && (
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-lg font-semibold text-slate-100">
                Password updated
              </h1>
              <p className="text-sm text-slate-400">
                Your password has been reset. You can now sign in with your new
                password.
              </p>
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors"
              >
                Go to sign in
              </Link>
            </div>
          )}

          {token && !success && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-lg font-semibold text-slate-100">
                  Set a new password
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Choose a new password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                      text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                      ${errors.password ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                  />
                  {errors.password && (
                    <span className="text-xs text-red-400">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword)
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));
                    }}
                    className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                      text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                      ${errors.confirmPassword ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                  />
                  {errors.confirmPassword && (
                    <span className="text-xs text-red-400">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Resetting…" : "Reset password"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Remembered your password?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
