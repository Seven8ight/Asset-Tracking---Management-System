"use client";

import { useState } from "react";

type Status = "Available" | "In Use" | "Under Repair" | "Broken";

interface Asset {
  id: string;
  name: string;
  description: string;
  dept: string;
  status: Status;
  qty: number;
  owner: string | null;
  image: string | null;
}

const STATUS_STYLES: Record<Status, string> = {
  "Available":    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Use":       "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Under Repair": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Broken":       "bg-red-500/15 text-red-400 border-red-500/20",
};

const CURRENT_USER = "Jane M.";
const CURRENT_ROLE = "asset_manager";

let nextId = 1;
const generateId = () => `AST-${String(nextId++).padStart(3, "0")}`;

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  // Form state for the Add Asset modal
  const [form, setForm] = useState({
    name: "",
    description: "",
    dept: "",
    status: "Available" as Status,
    qty: "1",
    image: null as string | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  // Handle image file upload — converts to base64 to display in browser
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Asset name is required";
    if (!form.dept.trim()) errs.dept = "Department is required";
    if (!form.qty || Number(form.qty) < 1) errs.qty = "Quantity must be at least 1";
    return errs;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newAsset: Asset = {
      id: generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      dept: form.dept.trim(),
      status: form.status,
      qty: Number(form.qty),
      owner: null,
      image: form.image,
    };

    setAssets((prev) => [newAsset, ...prev]);

    // Reset form and close modal
    setForm({ name: "", description: "", dept: "", status: "Available", qty: "1", image: null });
    setErrors({});
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleOwnership = (id: string) => {
    setAssets((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      if (a.owner === CURRENT_USER) {
        return { ...a, owner: null, status: "Available" };
      }
      if (a.status === "Available") {
        return { ...a, owner: CURRENT_USER, status: "In Use" };
      }
      return a;
    }));
  };

  const filtered = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const canEdit = CURRENT_ROLE === "asset_manager" || CURRENT_ROLE === "saas_admin";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Assets</h1>
          <p className="text-sm text-slate-400 mt-1">
            {assets.length === 0
              ? "No assets yet. Add your first one to get started."
              : `${assets.length} asset${assets.length === 1 ? "" : "s"} in your department.`}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Add Asset
          </button>
        )}
      </div>

      {/* Only show filters when there are assets */}
      {assets.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                       text-sm text-slate-200 placeholder:text-slate-500 w-56
                       focus:outline-none focus:border-indigo-500/50"
          />
          <div className="flex gap-2 flex-wrap">
            {["All", "Available", "In Use", "Under Repair", "Broken"].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${filter === s
                    ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                    : "text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/5"
                  }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-white/5 border-dashed">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No assets yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Add your department&apos;s first asset to start tracking it.
            Staff will be able to view and claim ownership once added.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Add your first asset
          </button>
        </div>
      )}

      {/* Assets table */}
      {assets.length > 0 && (
        <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Asset", "Department", "Status", "Owner", "Qty", "Actions"].map((h) => (
                  <th key={h}
                    className="text-left px-4 py-3 text-xs font-semibold
                               text-slate-400 uppercase tracking-wider whitespace-nowrap">
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

                  {/* Asset name + ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Image thumbnail or placeholder */}
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border
                                      border-white/5 flex items-center justify-center
                                      flex-shrink-0 overflow-hidden">
                        {asset.image ? (
                          <img src={asset.image} alt={asset.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{asset.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">
                            {asset.id}
                          </span>
                          {asset.description && (
                            <span className="text-xs text-slate-600 truncate max-w-[140px]">
                              · {asset.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-400 text-xs">{asset.dept}</td>

                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${STATUS_STYLES[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs">
                    {asset.owner
                      ? <span className="text-slate-300">{asset.owner}</span>
                      : <span className="text-slate-600 italic">Unassigned</span>
                    }
                  </td>

                  <td className="px-4 py-3 text-slate-300 text-center">
                    {asset.qty}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Ownership toggle */}
                      {(asset.status === "Available" || asset.owner === CURRENT_USER) && (
                        <button
                          onClick={() => toggleOwnership(asset.id)}
                          title={asset.owner === CURRENT_USER ? "Return asset" : "Claim asset"}
                          className={`relative w-9 h-5 rounded-full border transition-all
                            ${asset.owner === CURRENT_USER
                              ? "bg-indigo-500 border-indigo-500"
                              : "bg-transparent border-slate-600 hover:border-slate-400"
                            }`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full
                            bg-white transition-all duration-200
                            ${asset.owner === CURRENT_USER ? "left-4" : "left-0.5"}`}
                          />
                        </button>
                      )}

                      {canEdit && (
                        <>
                          <button className="text-xs text-indigo-400 hover:text-indigo-300
                                             font-medium transition-colors">
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="text-xs text-red-400 hover:text-red-300
                                       font-medium transition-colors">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && assets.length > 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              No assets match your search.
            </div>
          )}
        </div>
      )}

      {/* ── Add Asset Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowModal(false); setErrors({}); }}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl
                          max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6
                            border-b border-white/5 sticky top-0
                            bg-[#1E293B] z-10">
              <h2 className="text-lg font-semibold text-slate-100">Add New Asset</h2>
              <button
                onClick={() => { setShowModal(false); setErrors({}); }}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-5">

              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Asset image
                  <span className="text-slate-600 font-normal ml-1">(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-white/5
                                  flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {form.image
                      ? <img src={form.image} alt="preview"
                          className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>
                    }
                  </div>
                  <div>
                    <label className="cursor-pointer px-3 py-2 rounded-lg border
                                      border-white/10 text-sm text-slate-400
                                      hover:border-white/20 hover:text-slate-200
                                      transition-colors inline-block">
                      Choose image
                      <input type="file" accept="image/*" onChange={handleImage}
                        className="hidden" />
                    </label>
                    <p className="text-xs text-slate-600 mt-1">JPG or PNG, max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Asset name <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. Dell Laptop, Epson Projector"
                  value={form.name}
                  onChange={setField("name")}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${errors.name
                      ? "border-red-500/40 focus:border-red-400"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {errors.name && (
                  <span className="text-xs text-red-400">{errors.name}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description
                  <span className="text-slate-600 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Model, specs, or any useful details"
                  value={form.description}
                  onChange={setField("description")}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             outline-none focus:border-indigo-500/50 resize-none
                             transition-all"
                />
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Department <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. IT Department, Facilities"
                  value={form.dept}
                  onChange={setField("dept")}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${errors.dept
                      ? "border-red-500/40 focus:border-red-400"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {errors.dept && (
                  <span className="text-xs text-red-400">{errors.dept}</span>
                )}
              </div>

              {/* Status and Quantity side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Initial status <span className="text-indigo-400">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={setField("status")}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                               text-sm text-slate-200 outline-none
                               focus:border-indigo-500/50 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Broken">Broken</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Quantity <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.qty}
                    onChange={setField("qty")}
                    className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                      text-slate-200 placeholder:text-slate-600 outline-none border
                      transition-all
                      ${errors.qty
                        ? "border-red-500/40 focus:border-red-400"
                        : "border-white/5 focus:border-indigo-500/50"
                      }`}
                  />
                  {errors.qty && (
                    <span className="text-xs text-red-400">{errors.qty}</span>
                  )}
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErrors({}); }}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:text-slate-200 hover:border-white/20
                             transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors">
                  Add asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}