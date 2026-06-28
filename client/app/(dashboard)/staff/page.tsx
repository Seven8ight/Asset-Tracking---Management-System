"use client";

import { useState, useEffect } from "react";
import { authApi, userRoleApi, roleApi } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  department_id: string;
  phone: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function StaffPage() {
  const { user } = useAuth();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    username: "", email: "", password: "",
  });
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Edit drawer state
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch department roles for the edit drawer
      const rolesData = await roleApi.getDepartmentRoles();
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      // Note: There's no "get department staff" endpoint directly
      // Staff are users who belong to the department
      // We'll show an empty state until your partner adds that endpoint
      setStaff([]);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const validateInvite = () => {
    const errs: Record<string, string> = {};
    if (!inviteForm.username.trim()) errs.username = "Name is required";
    if (!inviteForm.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email))
      errs.email = "Enter a valid email";
    if (!inviteForm.password) errs.password = "Temporary password is required";
    else if (inviteForm.password.length < 8)
      errs.password = "Must be at least 8 characters";
    return errs;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateInvite();
    if (Object.keys(errs).length) { setInviteErrors(errs); return; }

    setInviting(true);
    setInviteSuccess("");
    setApiError("");

    try {
      // POST /auth/invite — sends invitation email to the user
      await authApi.invite({
        username: inviteForm.username.trim(),
        email: inviteForm.email.trim(),
        password: inviteForm.password,
      });

      setInviteSuccess(
        `Invitation sent to ${inviteForm.email}. They'll receive an email to join.`
      );
      setInviteForm({ username: "", email: "", password: "" });
      setInviteErrors({});
      // Refresh staff list after a moment
      setTimeout(() => {
        setInviteSuccess("");
        setShowInviteModal(false);
      }, 3000);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const openEditDrawer = async (member: StaffMember) => {
    setSelectedStaff(member);
    setSelectedRoles([]);
    // Could fetch this user's roles here if endpoint exists
  };

  const handleSaveRoles = async () => {
    if (!selectedStaff) return;
    setSavingRoles(true);
    try {
      // Assign each selected role
      for (const roleId of selectedRoles) {
        await userRoleApi.assign(roleId);
      }
      setSelectedStaff(null);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSavingRoles(false);
    }
  };

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Staff</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage department members and their roles.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + Invite Staff
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border
                        border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Search */}
      <input
        type="text" placeholder="Search staff…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                   text-sm text-slate-200 placeholder:text-slate-500 w-64
                   focus:outline-none focus:border-indigo-500/50"
      />

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && staff.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No staff members yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Invite your first team member. They&apos;ll receive an email
            to join your department.
          </p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Invite your first staff member
          </button>
        </div>
      )}

      {/* Staff table */}
      {!loading && staff.length > 0 && (
        <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Member", "Email", "Joined", "Actions"].map((h) => (
                  <th key={h}
                    className="text-left px-4 py-3 text-xs font-semibold
                               text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}
                  className="border-b border-white/5 last:border-0
                             hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                                      border-indigo-500/30 flex items-center justify-center
                                      text-xs font-bold text-indigo-300 flex-shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <p className="font-medium text-slate-200">{s.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditDrawer(s)}
                        className="text-xs text-indigo-400 hover:text-indigo-300
                                   font-medium transition-colors">
                        Edit roles
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowInviteModal(false);
              setInviteErrors({});
              setInviteSuccess("");
            }} />

          <div className="relative z-10 w-full max-w-md bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-slate-100">Invite Staff Member</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteErrors({});
                  setInviteSuccess("");
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 flex flex-col gap-5">

              {inviteSuccess && (
                <div className="p-3 rounded-md bg-emerald-500/10 border
                                border-emerald-500/20 text-sm text-emerald-300">
                  {inviteSuccess}
                </div>
              )}

              {apiError && (
                <div className="p-3 rounded-md bg-red-500/10 border
                                border-red-500/20 text-sm text-red-300">
                  {apiError}
                </div>
              )}

              <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10
                              text-xs text-slate-400 leading-relaxed">
                An invitation email will be sent to this address. They&apos;ll
                use the temporary password to sign in and can change it in settings.
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Full name <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. John Kamau"
                  value={inviteForm.username}
                  onChange={(e) => {
                    setInviteForm((p) => ({ ...p, username: e.target.value }));
                    if (inviteErrors.username)
                      setInviteErrors((p) => ({ ...p, username: "" }));
                  }}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${inviteErrors.username
                      ? "border-red-500/40"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {inviteErrors.username && (
                  <span className="text-xs text-red-400">{inviteErrors.username}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Email address <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="staff@strathmore.edu"
                  value={inviteForm.email}
                  onChange={(e) => {
                    setInviteForm((p) => ({ ...p, email: e.target.value }));
                    if (inviteErrors.email)
                      setInviteErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${inviteErrors.email
                      ? "border-red-500/40"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {inviteErrors.email && (
                  <span className="text-xs text-red-400">{inviteErrors.email}</span>
                )}
              </div>

              {/* Temp password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Temporary password <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="They can change this after signing in"
                  value={inviteForm.password}
                  onChange={(e) => {
                    setInviteForm((p) => ({ ...p, password: e.target.value }));
                    if (inviteErrors.password)
                      setInviteErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${inviteErrors.password
                      ? "border-red-500/40"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {inviteErrors.password && (
                  <span className="text-xs text-red-400">{inviteErrors.password}</span>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteErrors({});
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {inviting ? "Sending invite…" : "Send invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Roles Drawer ── */}
      {selectedStaff && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelectedStaff(null)} />

          <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-[#1E293B]
                          border-l border-white/5 flex flex-col shadow-2xl">

            <div className="flex items-center justify-between p-5
                            border-b border-white/5 flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-100">Edit Roles</h2>
              <button onClick={() => setSelectedStaff(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">

              {/* Staff info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border
                                border-indigo-500/30 flex items-center justify-center
                                text-sm font-bold text-indigo-300">
                  {getInitials(selectedStaff.name)}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{selectedStaff.name}</p>
                  <p className="text-xs text-slate-500">{selectedStaff.email}</p>
                </div>
              </div>

              {/* Role checkboxes */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assign Roles
                </p>
                {roles.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No roles in this department yet. Create roles first.
                  </p>
                ) : (
                  roles.map((role) => (
                    <label key={role.id}
                      className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => {
                          setSelectedRoles((prev) =>
                            prev.includes(role.id)
                              ? prev.filter((r) => r !== role.id)
                              : [...prev, role.id]
                          );
                        }}
                        className="mt-0.5 w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-300
                                      group-hover:text-slate-100 transition-colors">
                          {role.name}
                        </p>
                        {role.description && (
                          <p className="text-xs text-slate-500">{role.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="p-5 border-t border-white/5 flex gap-3 flex-shrink-0">
              <button onClick={() => setSelectedStaff(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                           text-slate-400 hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={savingRoles}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {savingRoles ? "Saving…" : "Save roles"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}