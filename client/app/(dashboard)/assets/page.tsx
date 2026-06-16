"use client";

import { useState } from "react";

const ASSETS = [
  { id: "AST-001", name: "Dell Laptop", dept: "IT Department", status: "In Use", qty: 5 },
  { id: "AST-002", name: "Epson Projector", dept: "Lecture Hall A", status: "Available", qty: 2 },
  { id: "AST-003", name: "Power Drill", dept: "Maintenance", status: "Under Repair", qty: 1 },
  { id: "AST-004", name: "HP Printer", dept: "Admin Office", status: "Available", qty: 3 },
  { id: "AST-005", name: "Office Chair", dept: "HR Department", status: "In Use", qty: 12 },
  { id: "AST-006", name: "Network Switch", dept: "IT Department", status: "Broken", qty: 1 },
  { id: "AST-007", name: "Whiteboard", dept: "Lecture Hall B", status: "Available", qty: 4 },
  { id: "AST-008", name: "Fire Extinguisher", dept: "Facilities", status: "In Use", qty: 8 },
];

const STATUS_COLORS: Record<string, string> = {
  "Available": "bg-emerald-500/15 text-emerald-400",
  "In Use": "bg-indigo-500/15 text-indigo-400",
  "Under Repair": "bg-amber-500/15 text-amber-400",
  "Broken": "bg-red-500/15 text-red-400",
};

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = ASSETS.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || a.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Assets</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage and track all department assets.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors">
          + Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                     text-sm text-slate-200 placeholder:text-slate-500
                     focus:outline-none focus:border-indigo-500/50 w-56"
        />
        {/* Status filter buttons */}
        {["All", "Available", "In Use", "Under Repair", "Broken"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === s
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 border border-white/5 hover:bg-white/5"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Asset ID", "Name", "Department", "Status", "Qty", "Actions"].map((h) => (
                <th key={h}
                  className="text-left px-4 py-3 text-xs font-semibold 
                             text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((asset) => (
              <tr key={asset.id}
                className="border-b border-white/5 last:border-0 
                           hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                  {asset.id}
                </td>
                <td className="px-4 py-3 text-slate-200 font-medium">
                  {asset.name}
                </td>
                <td className="px-4 py-3 text-slate-400">{asset.dept}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${STATUS_COLORS[asset.status]}`}>
                    {asset.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{asset.qty}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 
                                       font-medium transition-colors">
                      Edit
                    </button>
                    <button className="text-xs text-red-400 hover:text-red-300 
                                       font-medium transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">
            No assets match your search.
          </div>
        )}
      </div>
    </div>
  );
}