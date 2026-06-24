"use client";

import { useState, useEffect } from "react";
import { assetApi } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

type Status = "Available" | "In Use" | "Under Repair" | "Broken";

interface Asset {
  id: string;
  name: string;
  description: string;
  department_id: string;
  status: Status;
  quantity: number;
  image_url: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<Status, string> = {
  "Available":    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "In Use":       "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "Under Repair": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Broken":       "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [apiError, setApiError] = useState("");

  // Form for add/edit
  const [form, setForm] = useState({
    name: "", description: "", status: "Available" as Status,
    quantity: "1", image: null as string | null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch assets on load
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await assetApi.getDepartmentAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Asset name is required";
    if (!form.quantity || Number(form.quantity) < 1) errs.quantity = "Quantity must be at least 1";
    return errs;
  };

  // Open add modal fresh
  const openAddModal = () => {
    setForm({ name: "", description: "", status: "Available", quantity: "1", image: null });
    setFormErrors({});
    setEditAsset(null);
    setShowAddModal(true);
  };

  // Open edit modal pre-filled
  const openEditModal = (asset: Asset) => {
    setForm({
      name: asset.name,
      description: asset.description ?? "",
      status: asset.status,
      quantity: String(asset.quantity),
      image: asset.image_url,
    });
    setFormErrors({});
    setEditAsset(asset);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      if (editAsset) {
        // Edit existing
        await assetApi.update(editAsset.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          quantity: Number(form.quantity),
          ...(form.image ? { image_url: form.image } : {}),
        });
      } else {
        // Create new
        await assetApi.create({
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
          quantity: Number(form.quantity),
          ...(form.image ? { image: form.image } : {}),
        });
      }
      await fetchAssets(); // refresh list
      setShowAddModal(false);
    } catch (err) {
      setFormErrors({ submit: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    try {
      await assetApi.delete(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const filtered = assets.filter((a) => {
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
            {loading ? "Loading…" : assets.length === 0
              ? "No assets yet. Add your first one."
              : `${assets.length} asset${assets.length === 1 ? "" : "s"} in your department.`}
          </p>
        </div>
        <button onClick={openAddModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + Add Asset
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Filters */}
      {assets.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" placeholder="Search assets…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                       text-sm text-slate-200 placeholder:text-slate-500 w-56
                       focus:outline-none focus:border-indigo-500/50" />
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

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && assets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No assets yet</h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Add your department&apos;s first asset to start tracking it.
          </p>
          <button onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Add your first asset
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && assets.length > 0 && (
        <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Asset", "Status", "Quantity", "Added", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold
                                         text-slate-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-white/5
                                      flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {asset.image_url
                          ? <img src={asset.image_url} alt={asset.name} className="w-full h-full object-cover" />
                          : <span className="text-lg">📦</span>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{asset.name}</p>
                        {asset.description && (
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">
                            {asset.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                      ${STATUS_STYLES[asset.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-center">{asset.quantity}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(asset.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditModal(asset)}
                        className="text-xs text-indigo-400 hover:text-indigo-300
                                   font-medium transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(asset.id)}
                        className="text-xs text-red-400 hover:text-red-300
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
            <div className="py-12 text-center text-slate-500 text-sm">
              No assets match your search.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl
                          max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5
                            sticky top-0 bg-[#1E293B] z-10">
              <h2 className="text-lg font-semibold text-slate-100">
                {editAsset ? "Edit Asset" : "Add New Asset"}
              </h2>
              <button onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

              {/* Image upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Image <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-800 border border-white/5
                                  flex items-center justify-center overflow-hidden flex-shrink-0">
                    {form.image
                      ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>
                    }
                  </div>
                  <label className="cursor-pointer px-3 py-2 rounded-lg border border-white/10
                                    text-sm text-slate-400 hover:border-white/20
                                    hover:text-slate-200 transition-colors inline-block">
                    Choose image
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Name <span className="text-indigo-400">*</span>
                </label>
                <input placeholder="e.g. Dell Laptop" value={form.name}
                  onChange={setField("name")}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                    ${formErrors.name ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                />
                {formErrors.name && <span className="text-xs text-red-400">{formErrors.name}</span>}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea rows={2} placeholder="Model, specs, details"
                  value={form.description} onChange={setField("description")}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             outline-none focus:border-indigo-500/50 resize-none transition-all"
                />
              </div>

              {/* Status + Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Status</label>
                  <select value={form.status} onChange={setField("status")}
                    className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                               text-sm text-slate-200 outline-none focus:border-indigo-500/50">
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Under Repair</option>
                    <option>Broken</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Quantity <span className="text-indigo-400">*</span>
                  </label>
                  <input type="number" min="1" placeholder="1"
                    value={form.quantity} onChange={setField("quantity")}
                    className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                      text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                      ${formErrors.quantity ? "border-red-500/40" : "border-white/5 focus:border-indigo-500/50"}`}
                  />
                  {formErrors.quantity && <span className="text-xs text-red-400">{formErrors.quantity}</span>}
                </div>
              </div>

              {formErrors.submit && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20
                                text-sm text-red-300">
                  {formErrors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting
                    ? "Saving…"
                    : editAsset ? "Save changes" : "Add asset"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}