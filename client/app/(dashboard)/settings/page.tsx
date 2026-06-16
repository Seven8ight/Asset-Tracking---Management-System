"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("Jane Mwangi");
  const [email, setEmail] = useState("j.mwangi@strathmore.edu");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile section */}
      <div className="p-6 rounded-xl bg-[#1E293B] border border-white/5">
        <h2 className="text-sm font-semibold text-slate-200 mb-5">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 border-2 
                          border-indigo-500/30 flex items-center justify-center
                          text-xl font-bold text-indigo-300">
            JM
          </div>
          <div>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 
                               font-medium transition-colors">
              Change avatar
            </button>
            <p className="text-xs text-slate-500 mt-0.5">JPG or PNG, max 2MB</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                         text-sm text-slate-200 focus:outline-none 
                         focus:border-indigo-500/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                         text-sm text-slate-200 focus:outline-none 
                         focus:border-indigo-500/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Role</label>
            <input
              value="Asset Manager"
              disabled
              className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                         text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600">
              Role is assigned by your SaaS admin.
            </p>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div className="p-6 rounded-xl bg-[#1E293B] border border-white/5">
        <h2 className="text-sm font-semibold text-slate-200 mb-5">Change Password</h2>
        <div className="flex flex-col gap-4">
          {["Current password", "New password", "Confirm new password"].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                           text-sm text-slate-200 focus:outline-none 
                           focus:border-indigo-500/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          Save changes
        </button>
        {saved && (
          <span className="text-sm text-emerald-400">✓ Saved successfully</span>
        )}
      </div>

    </div>
  );
}