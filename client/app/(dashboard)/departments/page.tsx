"use client";

import { useState, useEffect } from "react";
import { departmentApi } from "../../../lib/api";

interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  created_at: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Modal state — shared for create and edit
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditDept(null);
    setForm({ name: "", description: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setEditDept(dept);
    setForm({ name: dept.name, description: dept.description ?? "" });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormErrors({ name: "Department name is required" });
      return;
    }

    setSubmitting(true);
    setApiError("");

    try {
      if (editDept) {
        // Edit existing department
        const updated = await departmentApi.update(editDept.id, {
          name: form.name.trim(),
          description: form.description.trim(),
        });
        setDepartments((prev) =>
          prev.map((d) => (d.id === editDept.id ? updated : d))
        );
      } else {
        // Create new department
        const created = await departmentApi.create({
          name: form.name.trim(),
          description: form.description.trim(),
        });
        setDepartments((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department? This cannot be undone.")) return;
    try {
      await departmentApi.delete(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  // Assign a color to each department card consistently
  const COLORS = ["#6366F1", "#34D399", "#F59E0B", "#F87171", "#A78BFA", "#38BDF8"];
  const getColor = (index: number) => COLORS[index % COLORS.length];

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Departments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? "Loading…" : `${departments.length} department${departments.length === 1 ? "" : "s"} registered.`}
          </p>
        </div>
        <button onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + New Department
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border
                        border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && departments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No departments yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Create your first department to start organising your staff and assets.
          </p>
          <button onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Create first department
          </button>
        </div>
      )}

      {/* Department cards */}
      {!loading && departments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, index) => (
            <div key={dept.id}
              className="p-5 rounded-xl bg-[#1E293B] border border-white/5
                         hover:border-white/10 transition-colors"
              style={{ borderTop: `3px solid ${getColor(index)}` }}>

              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-100 text-base">
                  {dept.name}
                </h3>
                {/* Actions menu */}
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEditModal(dept)}
                    className="text-xs text-indigo-400 hover:text-indigo-300
                               font-medium transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(dept.id)}
                    className="text-xs text-red-400 hover:text-red-300
                               font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>

              {dept.description && (
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {dept.description}
                </p>
              )}

              <div className="pt-3 border-t border-white/5">
                <p className="text-xs text-slate-500">
                  Created{" "}
                  <span className="text-slate-400">
                    {new Date(dept.created_at).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)} />

          <div className="relative z-10 w-full max-w-md bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-slate-100">
                {editDept ? "Edit Department" : "Create Department"}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

              {apiError && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20
                                text-sm text-red-300">
                  {apiError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. IT Department, Facilities"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    if (formErrors.name)
                      setFormErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border
                    transition-all
                    ${formErrors.name
                      ? "border-red-500/40"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {formErrors.name && (
                  <span className="text-xs text-red-400">{formErrors.name}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="What does this department manage?"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             outline-none focus:border-indigo-500/50 resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
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
                    : editDept ? "Save changes" : "Create department"
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