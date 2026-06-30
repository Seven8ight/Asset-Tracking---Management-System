"use client";

import { useEffect, useState } from "react";
import { departmentApi } from "@/lib/api";
import { useAuth } from "@/app/_lib/context/AuthContext";

type FullDepartmentDetails = {
  id: string;
  name: string;
  description: string;
  color: string;
  manager_id: string;
  created_at: string;
  manager_name: string;
};

type DepartmentMember = {
  id: string;
  name: string;
  username?: string;
  email: string;
  role_name?: string;
};

type ApiResponse<T> = {
  response?: { message?: T };
};

export default function DepartmentsPage() {
  const [department, setDepartment] = useState<FullDepartmentDetails | null>(
    null,
  );
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    color: "#6366F1",
  });

  const fetchDepartment = async () => {
    setLoading(true);
    try {
      // NOTE: assumes departmentApi exposes a way to resolve the current
      // user's own department (e.g. via their session/JWT) rather than
      // taking an arbitrary departmentId param. Adjust the call below to
      // match whatever your api client actually exposes for "my department".
      const data = (await departmentApi.getOne(
        user!.department_id as string,
      )) as ApiResponse<FullDepartmentDetails>;
      const dept = data?.response?.message ?? null;
      setDepartment(dept);

      if (dept) {
        const memberData = (await departmentApi.getAllUsers()) as ApiResponse<
          DepartmentMember[]
        >;
        const allMembers = memberData?.response?.message;
        setMembers(Array.isArray(allMembers) ? allMembers : []);
      }

      setError("");
    } catch (err) {
      setError((err as Error).message || "Failed to load department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartment();
  }, []);

  const openEditModal = () => {
    if (!department) return;
    setEditForm({
      name: department.name,
      description: department.description,
      color: department.color,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const saveDepartment = async () => {
    if (!department) return;
    if (!editForm.name.trim() || !editForm.description.trim()) {
      setError("Name and description are required");
      return;
    }

    setSubmitting(true);
    try {
      await departmentApi.update(department.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        color: editForm.color,
      });

      setShowEditModal(false);
      await fetchDepartment();
    } catch (err) {
      setError((err as Error).message || "Failed to update department");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          My Department
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Details for the department you belong to.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-white/10 bg-[#1E293B] p-5 text-sm text-slate-400">
          Loading department...
        </div>
      )}

      {!loading && !department && !error && (
        <div className="rounded-xl border border-white/10 bg-[#1E293B] p-5 text-sm text-slate-400">
          You are not assigned to a department yet.
        </div>
      )}

      {!loading && department && (
        <div className="flex flex-col gap-4">
          {/* Department details card */}
          <div
            className="p-6 rounded-xl bg-[#1E293B] border border-white/5"
            style={{ borderTop: `3px solid ${department.color}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">
                {department.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {department.color}
                </span>
                <button
                  onClick={openEditModal}
                  className="px-3 py-1.5 rounded-md border border-white/10
                             text-xs text-slate-300 hover:text-white
                             hover:border-white/20 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              {department.description}
            </p>
            <div className="flex gap-6 pt-4 border-t border-white/5 text-xs text-slate-500">
              <div>
                <div className="text-slate-300">Manager</div>
                <div className="text-slate-400">
                  {department.manager_name || "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-slate-300">Department ID</div>
                <div className="text-slate-400">
                  {department.id.slice(0, 8)}...
                </div>
              </div>
              <div>
                <div className="text-slate-300">Created</div>
                <div className="text-slate-400">
                  {new Date(department.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="rounded-xl bg-[#1E293B] border border-white/5 p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-4">
              Members ({members.length})
            </h3>

            {members.length === 0 ? (
              <p className="text-sm text-slate-400">
                No other members in this department yet.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <div className="text-sm text-slate-200">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </div>
                    {m.role_name && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400">
                        {m.role_name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit department modal */}
      {showEditModal && department && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          {/* Modal box */}
          <div
            className="relative z-10 w-full max-w-md bg-[#1E293B] 
                          rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-100">
                Edit Department
              </h2>
              <button
                onClick={closeEditModal}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  placeholder="e.g. IT Department"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What does this department manage?"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Color
                </label>
                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="h-10 w-full cursor-pointer rounded-lg bg-[#0F172A] border border-white/5 p-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeEditModal}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 
                             text-sm text-slate-400 hover:text-slate-200 
                             hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDepartment}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
