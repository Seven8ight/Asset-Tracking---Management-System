"use client";

import { useState } from "react";

const STAFF = [
  { name: "Jane Mwangi", email: "j.mwangi@strathmore.edu", role: "Asset Manager", dept: "Facilities", status: "Active" },
  { name: "John Kamau", email: "j.kamau@strathmore.edu", role: "Support Staff", dept: "IT Department", status: "Active" },
  { name: "Mary Wanjiku", email: "m.wanjiku@strathmore.edu", role: "Maintenance Engineer", dept: "Maintenance", status: "Active" },
  { name: "Peter Odhiambo", email: "p.odhiambo@strathmore.edu", role: "Support Staff", dept: "Admin Office", status: "Inactive" },
  { name: "Alice Mutua", email: "a.mutua@strathmore.edu", role: "Support Staff", dept: "HR Department", status: "Active" },
  { name: "David Njoroge", email: "d.njoroge@strathmore.edu", role: "Maintenance Engineer", dept: "Facilities", status: "Active" },
];

const ROLE_COLORS: Record<string, string> = {
  "Asset Manager": "bg-indigo-500/15 text-indigo-400",
  "Support Staff": "bg-emerald-500/15 text-emerald-400",
  "Maintenance Engineer": "bg-amber-500/15 text-amber-400",
};

export default function StaffPage() {
  const [search, setSearch] = useState("");

  const filtered = STAFF.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Staff</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage department members and their roles.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors">
          + Invite Staff
        </button>
      </div>

      <input
        type="text"
        placeholder="Search staff..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                   text-sm text-slate-200 placeholder:text-slate-500
                   focus:outline-none focus:border-indigo-500/50 w-64"
      />

      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Member", "Role", "Department", "Status", "Actions"].map((h) => (
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
              <tr key={s.email}
                className="border-b border-white/5 last:border-0 
                           hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar from initials */}
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                                    border-indigo-500/30 flex items-center justify-center
                                    text-xs font-bold text-indigo-300 flex-shrink-0">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${ROLE_COLORS[s.role] ?? "bg-slate-500/15 text-slate-400"}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{s.dept}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium
                    ${s.status === "Active" ? "text-emerald-400" : "text-slate-500"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 
                                       font-medium transition-colors">Edit</button>
                    <button className="text-xs text-red-400 hover:text-red-300 
                                       font-medium transition-colors">Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}