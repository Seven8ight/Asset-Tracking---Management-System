"use client";

import { useState } from "react";

const DEPARTMENTS = [
  { name: "Facilities", manager: "Jane Mwangi", members: 8, assets: 45, color: "#6366F1" },
  { name: "IT Department", manager: "John Kamau", members: 12, assets: 98, color: "#34D399" },
  { name: "Maintenance", manager: "David Njoroge", members: 6, assets: 67, color: "#F59E0B" },
  { name: "Admin Office", manager: "Alice Mutua", members: 5, assets: 23, color: "#F87171" },
  { name: "HR Department", manager: "Peter Odhiambo", members: 4, assets: 15, color: "#A78BFA" },
  { name: "Lecture Hall A", manager: "Mary Wanjiku", members: 3, assets: 12, color: "#38BDF8" },
];

export default function DepartmentsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Departments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create and manage your organisation&apos;s departments.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + New Department
        </button>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEPARTMENTS.map((d) => (
          <div key={d.name}
            className="p-5 rounded-xl bg-[#1E293B] border border-white/5
                       hover:border-white/10 transition-colors"
            style={{ borderTop: `3px solid ${d.color}` }}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-slate-100">{d.name}</h3>
              <button className="text-xs text-slate-500 hover:text-slate-300 
                                 transition-colors">
                ···
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Manager: <span className="text-slate-400">{d.manager}</span>
            </p>
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <div>
                <div className="text-lg font-bold text-slate-200">{d.members}</div>
                <div className="text-xs text-slate-500">Members</div>
              </div>
              <div>
                <div className="text-lg font-bold text-slate-200">{d.assets}</div>
                <div className="text-xs text-slate-500">Assets</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create department modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          {/* Modal box */}
          <div className="relative z-10 w-full max-w-md bg-[#1E293B] 
                          rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-100">
                Create Department
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Name</label>
                <input
                  placeholder="e.g. IT Department"
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="What does this department manage?"
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 
                             text-sm text-slate-400 hover:text-slate-200 
                             hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}