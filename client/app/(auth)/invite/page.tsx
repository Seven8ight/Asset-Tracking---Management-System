"use client";

import Link from "next/link";
import { useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../_lib/ui/Button";
import Input from "../../_lib/ui/Input";
import { authApi, clearTokens, saveTokens, userApi } from "@/lib/api";

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

type RefreshPayload = {
  accessToken: string;
};

// 1. The actual form component containing your logic
function InviteAcceptForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!token) {
      nextErrors.token = "Invite token is missing from this URL.";
      return nextErrors;
    }

    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 8)
      nextErrors.password = "Password must be at least 8 characters";

    if (!confirmPassword)
      nextErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match";

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setApiError("");
    setLoading(true);

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

      await userApi.update({
        password,
      });

      clearTokens();
      setDone(true);
    } catch (err) {
      setApiError((err as Error).message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-emerald-300">
            Password updated
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Your account is now ready. Sign in with your new password.
          </p>
          <div className="mt-5">
            <Button onClick={() => router.push("/login")} fullWidth>
              Go to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md"
      style={{ animation: "fadeUp 0.4s ease both" }}
    >
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
      >
        ← Back to sign in
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-100">
        Accept invitation
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        Set your password to activate your invited account.
      </p>

      {(errors.token || apiError) && (
        <div className="mb-5 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {errors.token || apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="invite-password"
          label="New password"
          type="password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={errors.password}
          required
        />

        <Input
          id="invite-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" fullWidth loading={loading}>
          Set password
        </Button>
      </form>
    </div>
  );
}

// 2. A matching skeleton UI to prevent layout shifts while Next.js parses the search params
function InviteAcceptLoading() {
  return (
    <div className="w-full max-w-md animate-pulse">
      {/* Back to sign in link placeholder */}
      <div className="mb-8 h-4 w-28 rounded bg-slate-800" />

      {/* Title & subtitle placeholders */}
      <div className="mb-2 h-8 w-48 rounded bg-slate-800" />
      <div className="mb-8 h-4 w-64 rounded bg-slate-800" />

      {/* Form Fields placeholders */}
      <div className="flex flex-col gap-5">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-10 w-full rounded bg-slate-800/50" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-800" />
          <div className="h-10 w-full rounded bg-slate-800/50" />
        </div>

        {/* Button placeholder */}
        <div className="mt-2 h-10 w-full rounded bg-slate-800" />
      </div>
    </div>
  );
}

// 3. Main Page wrapper exported with the Suspense boundary
export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptLoading />}>
      <InviteAcceptForm />
    </Suspense>
  );
}
