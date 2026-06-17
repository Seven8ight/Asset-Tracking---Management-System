"use client";

import { useState } from "react";

const REPAIR_ITEMS = [
  { id: "AST-003", name: "Power Drill", issue: "Motor making grinding noise", reportedBy: "John K.", reportedAt: "Today, 08:30 AM", status: "In Progress" },
  { id: "AST-006", name: "Network Switch", issue: "Two ports not responding", reportedBy: "Mary W.", reportedAt: "Yesterday, 3:15 PM", status: "Pending" },
  { id: "AST-017", name: "Epson Projector", issue: "Lamp needs replacement", reportedBy: "Alice M.", reportedAt: "2 days ago", status: "Pending" },
  { id: "AST-022", name: "Office Printer", issue: "Paper jam — internal damage", reportedBy: "Peter O.", reportedAt: "3 days ago", status: "Completed" },
];

const STATUS_STYLES: Record<string, string> = {
  "Pending": "bg-amber-500/15 text-amber-400",
  "In Progress": "bg-indigo-500/15 text-indigo-400",
  "Completed": "bg-emerald-500/15 text-emerald-400",
};

export default function MaintenancePage() {
  const [items, setItems] = useState(REPAIR_ITEMS);

  const updateStatus = (id: string, status: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const pending = items.filter((i) => i.status === "Pending").length;
  const inProgress = items.filter((i) => i.status === "In Progress").length;
  const completed = items.filter((i) => i.status === "Completed").length;

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          Maintenance
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Track and manage all reported asset issues.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, color: "#F59E0B" },
          { label: "In Progress", value: inProgress, color: "#6366F1" },
          { label: "Completed", value: completed, color: "#34D399" },
        ].map((s) => (
          <div key={s.label}
            className="p-4 rounded-xl bg-[#1E293B] border border-white/5 text-center">
            <div className="text-2xl font-bold mb-1"
              style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Repair items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-mono text-xs text-slate-500">{item.id}</span>
                  <h3 className="font-semibold text-slate-100">{item.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${STATUS_STYLES[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{item.issue}</p>
                <p className="text-xs text-slate-500">
                  Reported by <span className="text-slate-400">{item.reportedBy}</span>
                  {" · "}{item.reportedAt}
                </p>
              </div>

              {/* Status update buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {item.status === "Pending" && (
                  <button
                    onClick={() => updateStatus(item.id, "In Progress")}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-300
                               text-xs font-medium hover:bg-indigo-500/25 transition-colors">
                    Start repair
                  </button>
                )}
                {item.status === "In Progress" && (
                  <button
                    onClick={() => updateStatus(item.id, "Completed")}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300
                               text-xs font-medium hover:bg-emerald-500/25 transition-colors">
                    Mark complete
                  </button>
                )}
                {item.status === "Completed" && (
                  <span className="text-xs text-slate-500 py-1.5">✓ Done</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}