"use client";

import { useState } from "react";

interface StaffMember {
  name: string;
  email: string;
  role: string;
  dept: string;
  status: "Active" | "Inactive";
  initials: string;
  permissions: {
    assets: { view: boolean; edit: boolean; delete: boolean };
    staff: { view: boolean; edit: boolean };
    reports: { view: boolean; export: boolean };
  };
}

const INITIAL_STAFF: StaffMember[] = [
  {
    name: "John Kamau", email: "j.kamau@strathmore.edu",
    role: "Support Staff", dept: "IT Department", status: "Active", initials: "JK",
    permissions: {
      assets: { view: true, edit: false, delete: false },
      staff: { view: false, edit: false },
      reports: { view: true, export: false },
    },
  },
  {
    name: "Mary Wanjiku", email: "m.wanjiku@strathmore.edu",
    role: "Maintenance Engineer", dept: "Maintenance", status: "Active", initials: "MW",
    permissions: {
      assets: { view: true, edit: true, delete: false },
      staff: { view: true, edit: false },
      reports: { view: true, export: true },
    },
  },
  {
    name: "Peter Odhiambo", email: "p.odhiambo@strathmore.edu",
    role: "Support Staff", dept: "Admin Office", status: "Inactive", initials: "PO",
    permissions: {
      assets: { view: true, edit: false, delete: false },
      staff: { view: false, edit: false },
      reports: { view: false, export: false },
    },
  },
  {
    name: "Alice Mutua", email: "a.mutua@strathmore.edu",
    role: "Support Staff", dept: "HR Department", status: "Active", initials: "AM",
    permissions: {
      assets: { view: true, edit: false, delete: false },
      staff: { view: false, edit: false },
      reports: { view: true, export: false },
    },
  },
];

const ROLE_STYLES: Record<string, string> = {
  "Asset Manager": "bg-indigo-500/15 text-indigo-400",
  "Support Staff": "bg-emerald-500/15 text-emerald-400",
  "Maintenance Engineer": "bg-amber-500/15 text-amber-400",
  "SaaS Admin": "bg-red-500/15 text-red-400",
};

export default function StaffPage() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StaffMember | null>(null);

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  // Toggle a permission on the selected staff member
  const togglePermission = (
    group: keyof StaffMember["permissions"],
    key: string
  ) => {
    if (!selected) return;
    setSelected((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [group]: {
            ...prev.permissions[group],
            [key]: !prev.permissions[group][key as keyof typeof prev.permissions[typeof group]],
          },
        },
      };
    });
  };

  const saveChanges = () => {
    if (!selected) return;
    setStaff((prev) =>
      prev.map((s) => (s.email === selected.email ? selected : s))
    );
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Staff</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage department members, roles, and permissions.
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors">
          + Invite Staff
        </button>
      </div>

      <input
        type="text" placeholder="Search staff…"
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                   text-sm text-slate-200 placeholder:text-slate-500 w-64
                   focus:outline-none focus:border-indigo-500/50"
      />

      {/* Table */}
      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
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
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border
                                    border-indigo-500/30 flex items-center justify-center
                                    text-xs font-bold text-indigo-300 flex-shrink-0">
                      {s.initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${ROLE_STYLES[s.role] ?? "bg-slate-500/15 text-slate-400"}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.dept}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium
                    ${s.status === "Active" ? "text-emerald-400" : "text-slate-500"}`}>
                    ● {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelected(s)}
                      className="text-xs text-indigo-400 hover:text-indigo-300
                                 font-medium transition-colors">
                      Edit
                    </button>
                    <button className="text-xs text-red-400 hover:text-red-300
                                       font-medium transition-colors">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit Drawer ── slides in from the right */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelected(null)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-[#1E293B]
                          border-l border-white/5 flex flex-col
                          shadow-2xl overflow-y-auto">

            {/* Drawer header */}
            <div className="flex items-center justify-between p-5
                            border-b border-white/5 flex-shrink-0">
              <h2 className="text-sm font-semibold text-slate-100">
                Edit Staff Permissions
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 p-5 flex flex-col gap-6">

              {/* Staff info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 border
                                border-indigo-500/30 flex items-center justify-center
                                text-sm font-bold text-indigo-300">
                  {selected.initials}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{selected.name}</p>
                  <p className="text-xs text-slate-500">{selected.email}</p>
                </div>
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400
                                  uppercase tracking-wider">Role</label>
                <select
                  value={selected.role}
                  onChange={(e) => setSelected({ ...selected, role: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 focus:outline-none
                             focus:border-indigo-500/50"
                >
                  <option>Support Staff</option>
                  <option>Maintenance Engineer</option>
                  <option>Asset Manager</option>
                </select>
              </div>

              {/* Permissions */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Permissions
                </p>

                {/* Assets group */}
                <PermissionGroup
                  label="Assets"
                  items={[
                    { key: "view", label: "View assets" },
                    { key: "edit", label: "Edit assets" },
                    { key: "delete", label: "Delete assets" },
                  ]}
                  values={selected.permissions.assets}
                  onChange={(key) => togglePermission("assets", key)}
                />

                {/* Staff group */}
                <PermissionGroup
                  label="Staff"
                  items={[
                    { key: "view", label: "View staff" },
                    { key: "edit", label: "Edit staff" },
                  ]}
                  values={selected.permissions.staff}
                  onChange={(key) => togglePermission("staff", key)}
                />

                {/* Reports group */}
                <PermissionGroup
                  label="Reports"
                  items={[
                    { key: "view", label: "View reports" },
                    { key: "export", label: "Export reports" },
                  ]}
                  values={selected.permissions.reports}
                  onChange={(key) => togglePermission("reports", key)}
                />
              </div>
            </div>

            {/* Drawer footer */}
            <div className="p-5 border-t border-white/5 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                           text-slate-400 hover:text-slate-200 hover:border-white/20
                           transition-colors">
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors">
                Save changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable permission group component
function PermissionGroup({
  label, items, values, onChange,
}: {
  label: string;
  items: { key: string; label: string }[];
  values: Record<string, boolean>;
  onChange: (key: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
      <div className="flex flex-col gap-2 pl-3 border-l-2 border-white/5">
        {items.map((item) => (
          <label key={item.key}
            className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={values[item.key] ?? false}
              onChange={() => onChange(item.key)}
              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-slate-400 group-hover:text-slate-200
                             transition-colors">
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}