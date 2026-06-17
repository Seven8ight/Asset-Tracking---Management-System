"use client";

import { useState } from "react";

const ROLES = [
  {
    name: "Asset Manager",
    color: "#6366F1",
    description: "Full control over the department — assets, staff, and settings.",
    permissions: ["View assets", "Create assets", "Edit assets", "Delete assets",
                  "View staff", "Invite staff", "Edit staff roles", "Remove staff",
                  "View reports", "Export reports", "Manage roles"],
    members: 1,
  },
  {
    name: "Maintenance Engineer",
    color: "#F59E0B",
    description: "Can view assets, flag for repair, and log maintenance activities.",
    permissions: ["View assets", "Edit asset status", "Log repairs",
                  "View staff", "View reports", "Export reports"],
    members: 2,
  },
  {
    name: "Support Staff",
    color: "#34D399",
    description: "Can view and claim ownership of available assets.",
    permissions: ["View assets", "Claim asset ownership", "Return assets",
                  "Report asset damage", "View reports"],
    members: 8,
  },
];

export default function RolesPage() {
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define what each role can do within your department.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + Create Role
        </button>
      </div>

      {/* Role cards */}
      <div className="flex flex-col gap-4">
        {ROLES.map((role) => (
          <div key={role.name}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: role.color }} />
                <div>
                  <h3 className="font-semibold text-slate-100">{role.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-slate-500">{role.members} members</span>
                <button className="text-xs text-indigo-400 hover:text-indigo-300
                                   font-medium transition-colors">
                  Edit
                </button>
              </div>
            </div>

            {/* Permission tags */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {role.permissions.map((p) => (
                <span key={p}
                  className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5
                             text-xs text-slate-400">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create role modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#1E293B]
                          rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-100">Create Custom Role</h2>
              <button onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Role name</label>
                <input
                  placeholder="e.g. Lab Technician"
                  value={newRole.name}
                  onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="What can this role do?"
                  value={newRole.description}
                  onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors">
                  Create role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}