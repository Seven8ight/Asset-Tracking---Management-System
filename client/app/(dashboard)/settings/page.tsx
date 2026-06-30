"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../_lib/context/AuthContext";
import { userApi } from "../../../lib/api";

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

type UpdatedUser = {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
};

export default function SettingsPage() {
  const { user, setUser, initials } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passError, setPassError] = useState("");

  useEffect(() => {
    let mounted = true;

    const hydrateProfile = async () => {
      if (!user?.id) return;

      try {
        const profileResponse = (await userApi.getMe(
          user.id,
        )) as ApiResponse<UpdatedUser>;
        const profile = profileResponse?.response?.message;

        if (!profile || !mounted) return;

        setForm((prev) => ({
          ...prev,
          name: profile.username ?? prev.name,
          email: profile.email ?? prev.email,
        }));
      } catch {
        // Keep existing local values when profile fetch fails.
      }
    };

    hydrateProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const updatedResponse = (await userApi.update({
        username: form.name.trim(),
        email: form.email.trim(),
      })) as ApiResponse<UpdatedUser>;
      const updated = updatedResponse?.response?.message;

      // Update the context so name changes everywhere immediately
      if (user) {
        setUser({
          ...user,
          name: updated?.username ?? form.name.trim(),
          email: updated?.email ?? form.email.trim(),
        });
      }

      setForm((prev) => ({
        ...prev,
        name: updated?.username ?? prev.name,
        email: updated?.email ?? prev.email,
      }));

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");

    if (!passForm.currentPassword) {
      setPassError("Current password is required");
      return;
    }
    if (!passForm.newPassword) {
      setPassError("New password is required");
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassError("Must be at least 8 characters");
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }

    setSavingPass(true);
    try {
      await userApi.update({ password: passForm.newPassword });
      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPassSuccess(true);
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      setPassError((err as Error).message);
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile */}
      <form
        onSubmit={handleProfileSave}
        className="p-6 rounded-xl bg-[#1E293B] border border-white/5"
      >
        <h2 className="text-sm font-semibold text-slate-200 mb-5">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full bg-indigo-500/20 border-2
                          border-indigo-500/30 flex items-center justify-center
                          text-xl font-bold text-indigo-300"
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { label: "Full name", key: "name", placeholder: "Your full name" },
            {
              label: "Email address",
              key: "email",
              placeholder: "your@email.com",
            },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                {f.label}
              </label>
              <input
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                           text-sm text-slate-200 focus:outline-none
                           focus:border-indigo-500/50 transition-all"
              />
            </div>
          ))}
        </div>

        {profileError && (
          <div
            className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20
                          text-sm text-red-300"
          >
            {profileError}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {profileSuccess && (
            <span className="text-sm text-emerald-400">
              ✓ Saved successfully
            </span>
          )}
        </div>
      </form>

      {/* Password */}
      <form
        onSubmit={handlePasswordSave}
        className="p-6 rounded-xl bg-[#1E293B] border border-white/5"
      >
        <h2 className="text-sm font-semibold text-slate-200 mb-5">
          Change Password
        </h2>

        <div className="flex flex-col gap-4">
          {[
            { label: "Current password", key: "currentPassword" },
            { label: "New password", key: "newPassword" },
            { label: "Confirm new password", key: "confirmPassword" },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                {f.label}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passForm[f.key as keyof typeof passForm]}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                           text-sm text-slate-200 focus:outline-none
                           focus:border-indigo-500/50 transition-all"
              />
            </div>
          ))}
        </div>

        {passError && (
          <div
            className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20
                          text-sm text-red-300"
          >
            {passError}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={savingPass}
            className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPass ? "Updating…" : "Update password"}
          </button>
          {passSuccess && (
            <span className="text-sm text-emerald-400">✓ Password updated</span>
          )}
        </div>
      </form>
    </div>
  );
}
