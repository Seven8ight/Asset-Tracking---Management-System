"use client";

import { useState, useEffect } from "react";
import { roleApi, permissionApi, rolePermissionApi } from "../../../lib/api";

interface Role {
  id: string;
  name: string;
  description: string;
  department_id: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // Role modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [roleFormErrors, setRoleFormErrors] = useState<Record<string, string>>({});
  const [submittingRole, setSubmittingRole] = useState(false);

  // Permission assignment drawer
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [assigningPerm, setAssigningPerm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        roleApi.getDepartmentRoles(),
        permissionApi.getAll(),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateRoleModal = () => {
    setEditRole(null);
    setRoleForm({ name: "", description: "" });
    setRoleFormErrors({});
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditRole(role);
    setRoleForm({ name: role.name, description: role.description ?? "" });
    setRoleFormErrors({});
    setShowRoleModal(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      setRoleFormErrors({ name: "Role name is required" });
      return;
    }

    setSubmittingRole(true);
    setApiError("");

    try {
      if (editRole) {
        const updated = await roleApi.update(editRole.id, {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
        });
        setRoles((prev) =>
          prev.map((r) => (r.id === editRole.id ? updated : r))
        );
      } else {
        const created = await roleApi.create({
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
        });
        setRoles((prev) => [created, ...prev]);
      }
      setShowRoleModal(false);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Delete this role? Staff assigned to it will lose access.")) return;
    try {
      await roleApi.delete(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  // Open permissions drawer for a role
  const openPermissionsDrawer = async (role: Role) => {
    setSelectedRole(role);
    try {
      const data = await rolePermissionApi.getRolePermissions(role.id);
      setRolePermissions(Array.isArray(data) ? data : []);
    } catch {
      setRolePermissions([]);
    }
  };

  const isPermissionAssigned = (permId: string) =>
    rolePermissions.some((p) => p.id === permId);

  const togglePermission = async (perm: Permission) => {
    if (!selectedRole) return;
    setAssigningPerm(true);
    try {
      if (isPermissionAssigned(perm.id)) {
        // Remove permission from role
        await rolePermissionApi.remove(selectedRole.id, perm.id);
        setRolePermissions((prev) => prev.filter((p) => p.id !== perm.id));
      } else {
        // Assign permission to role
        await rolePermissionApi.assign(selectedRole.id, perm.id);
        setRolePermissions((prev) => [...prev, perm]);
      }
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setAssigningPerm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define what each role can do in your department.
          </p>
        </div>
        <button onClick={openCreateRoleModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors">
          + Create Role
        </button>
      </div>

      {apiError && (
        <div className="p-3 rounded-md text-sm bg-red-500/10 border
                        border-red-500/20 text-red-300">
          {apiError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && roles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24
                        rounded-xl bg-[#1E293B] border border-dashed border-white/10">
          <div className="text-5xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            No roles yet
          </h3>
          <p className="text-sm text-slate-400 text-center max-w-xs mb-6">
            Create roles to define what your staff can do, then assign
            permissions to each role.
          </p>
          <button onClick={openCreateRoleModal}
            className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                       text-white text-sm font-semibold transition-colors">
            + Create first role
          </button>
        </div>
      )}

      {/* Roles list */}
      {!loading && roles.length > 0 && (
        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <div key={role.id}
              className="p-5 rounded-xl bg-[#1E293B] border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-100 mb-1">{role.name}</h3>
                  {role.description && (
                    <p className="text-sm text-slate-400">{role.description}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Created {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => openPermissionsDrawer(role)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300
                               text-xs font-medium hover:bg-indigo-500/20 transition-colors">
                    Permissions
                  </button>
                  <button onClick={() => openEditRoleModal(role)}
                    className="text-xs text-slate-400 hover:text-slate-200
                               font-medium transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteRole(role.id)}
                    className="text-xs text-red-400 hover:text-red-300
                               font-medium transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role create/edit Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRoleModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-[#1E293B]
                          rounded-xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-slate-100">
                {editRole ? "Edit Role" : "Create Role"}
              </h2>
              <button onClick={() => setShowRoleModal(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors">✕</button>
            </div>
            <form onSubmit={handleRoleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Role name <span className="text-indigo-400">*</span>
                </label>
                <input
                  placeholder="e.g. Lab Technician, Store Keeper"
                  value={roleForm.name}
                  onChange={(e) => {
                    setRoleForm((p) => ({ ...p, name: e.target.value }));
                    if (roleFormErrors.name)
                      setRoleFormErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={`px-3.5 py-2.5 rounded-lg bg-[#0F172A] text-sm
                    text-slate-200 placeholder:text-slate-600 outline-none border transition-all
                    ${roleFormErrors.name
                      ? "border-red-500/40"
                      : "border-white/5 focus:border-indigo-500/50"
                    }`}
                />
                {roleFormErrors.name && (
                  <span className="text-xs text-red-400">{roleFormErrors.name}</span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Description{" "}
                  <span className="text-slate-600 font-normal">(optional)</span>
                </label>
                <textarea rows={2}
                  placeholder="What can this role do?"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             outline-none focus:border-indigo-500/50 resize-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submittingRole}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {submittingRole
                    ? "Saving…"
                    : editRole ? "Save changes" : "Create role"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Drawer */}
      {selectedRole && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelectedRole(null)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-[#1E293B]
                          border-l border-white/5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5
                            border-b border-white/5 flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  {selectedRole.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage permissions</p>
              </div>
              <button onClick={() => setSelectedRole(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors">✕</button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto">
              {permissions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No permissions available. Ask your SaaS admin to create permissions.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Toggle permissions for this role
                  </p>
                  {permissions.map((perm) => {
                    const assigned = isPermissionAssigned(perm.id);
                    return (
                      <label key={perm.id}
                        className="flex items-start gap-3 cursor-pointer group">
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={assigned}
                            disabled={assigningPerm}
                            onChange={() => togglePermission(perm)}
                            className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors
                            ${assigned ? "text-slate-200" : "text-slate-400"}
                            group-hover:text-slate-200`}>
                            {perm.name}
                          </p>
                          {perm.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/5 flex-shrink-0">
              <button onClick={() => setSelectedRole(null)}
                className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors">
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}