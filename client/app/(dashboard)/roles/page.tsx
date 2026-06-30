"use client";

import { useEffect, useState } from "react";
import { permissionsApi, rolePermissionsApi, rolesApi } from "@/lib/api";

type BackendRole = {
  id: string;
  name: string;
  description: string;
  department_id: string | null;
};

type Permission = {
  permissionId: string;
  name: string;
  description?: string | null;
};

type AvailablePermission = {
  id: string;
  name: string;
  group_name: string;
  description?: string | null;
};

type BackendRoleWithPermissions = {
  roleId: string;
  roleName: string;
  roleDescription: string | null;
  permissions: Permission[];
};

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

type UiRole = {
  id: string;
  name: string;
  color: string;
  description: string;
  permissions: string[];
  scope: "System" | "Department";
};

const ROLE_COLORS = ["#6366F1", "#F59E0B", "#34D399", "#F87171", "#38BDF8"];

export default function RolesPage() {
  const [roles, setRoles] = useState<UiRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<UiRole | null>(null);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [availablePermissions, setAvailablePermissions] = useState<
    AvailablePermission[]
  >([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const rolesResponse =
        (await rolesApi.getDepartmentRoles()) as ApiResponse<BackendRole[]>;
      const roleList = rolesResponse?.response?.message ?? [];

      if (!Array.isArray(roleList)) {
        setRoles([]);
        return;
      }

      const enrichedRoles = await Promise.all(
        roleList.map(async (role, index) => {
          try {
            const permissionsResponse = (await rolesApi.getRolePermissions(
              role.id,
            )) as ApiResponse<BackendRoleWithPermissions>;

            const rolePermissions =
              permissionsResponse?.response?.message?.permissions ?? [];

            const uniquePermissionNames = Array.from(
              new Set(rolePermissions.map((permission) => permission.name)),
            );

            return {
              id: role.id,
              name: role.name,
              description: role.description || "No description provided.",
              color: ROLE_COLORS[index % ROLE_COLORS.length],
              permissions: uniquePermissionNames,
              scope: role.department_id ? "Department" : "System",
            } as UiRole;
          } catch {
            return {
              id: role.id,
              name: role.name,
              description: role.description || "No description provided.",
              color: ROLE_COLORS[index % ROLE_COLORS.length],
              permissions: [],
              scope: role.department_id ? "Department" : "System",
            } as UiRole;
          }
        }),
      );

      setRoles(enrichedRoles);
      setError("");
    } catch (err) {
      setError((err as Error).message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchAvailablePermissions = async () => {
    const response = (await permissionsApi.getAll()) as ApiResponse<
      AvailablePermission[]
    >;
    const values = response?.response?.message ?? [];

    if (!Array.isArray(values)) {
      setAvailablePermissions([]);
      return;
    }

    setAvailablePermissions(values);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setNewRole({ name: "", description: "" });
    setSelectedPermissionIds([]);
  };

  const openCreateModal = async () => {
    setError("");
    setEditingRole(null);
    setNewRole({ name: "", description: "" });
    setSelectedPermissionIds([]);

    try {
      await fetchAvailablePermissions();
      setShowModal(true);
    } catch (err) {
      setError((err as Error).message || "Failed to load permissions");
    }
  };

  const openEditModal = (role: UiRole) => {
    setError("");
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
    });
    setShowModal(true);
  };

  const saveRole = async () => {
    if (!newRole.name.trim() || !newRole.description.trim()) {
      setError("Role name and description are required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingRole) {
        await rolesApi.updateRole(editingRole.id, {
          name: newRole.name.trim(),
          description: newRole.description.trim(),
        });
      } else {
        const createResponse = (await rolesApi.createRole({
          name: newRole.name.trim(),
          description: newRole.description.trim(),
        })) as ApiResponse<BackendRole>;

        const createdRole = createResponse?.response?.message;
        if (!createdRole?.id)
          throw new Error("Role was created without a valid id");

        if (selectedPermissionIds.length > 0) {
          await rolePermissionsApi.assignToRole({
            role_id: createdRole.id,
            permission_id: selectedPermissionIds,
          });
        }
      }

      closeModal();
      await fetchRoles();
    } catch (err) {
      setError(
        (err as Error).message ||
          (editingRole ? "Failed to update role" : "Failed to create role"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRole = async (role: UiRole) => {
    const confirmed = window.confirm(
      `Delete role \"${role.name}\"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setDeletingRoleId(role.id);
      await rolesApi.deleteRole(role.id);
      await fetchRoles();
    } catch (err) {
      setError((err as Error).message || "Failed to delete role");
    } finally {
      setDeletingRoleId(null);
    }
  };

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const groupedPermissions = availablePermissions.reduce(
    (acc, permission) => {
      const key = permission.group_name || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(permission);
      return acc;
    },
    {} as Record<string, AvailablePermission[]>,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define what each role can do within your department.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                     text-white text-sm font-semibold transition-colors"
        >
          + Create Role
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Role cards */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="rounded-xl bg-[#1E293B] border border-white/5 p-5 text-sm text-slate-400">
            Loading roles...
          </div>
        )}

        {!loading && roles.length === 0 && (
          <div className="rounded-xl bg-[#1E293B] border border-white/5 p-5 text-sm text-slate-400">
            No roles found.
          </div>
        )}

        {!loading &&
          roles.map((role) => (
            <div
              key={role.id}
              className="p-5 rounded-xl bg-[#1E293B] border border-white/5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: role.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-slate-100">
                      {role.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs rounded-full border border-white/10 bg-white/5 px-2 py-1 text-slate-400">
                    {role.scope}
                  </span>
                  {role.scope == "Department" ? (
                    <>
                      <button
                        onClick={() => openEditModal(role)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRole(role)}
                        disabled={deletingRoleId === role.id}
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingRoleId === role.id ? "Deleting..." : "Delete"}
                      </button>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              {/* Permission tags */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                {role.permissions.length === 0 && (
                  <span className="text-xs text-slate-500">
                    No permissions assigned.
                  </span>
                )}
                {role.permissions.map((p, index) => (
                  <span
                    key={`${role.id}-${p}-${index}`}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5
                             text-xs text-slate-400"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Create role modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl
                          border border-white/10 bg-[#1E293B] shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">
                  {editingRole ? "Edit Role" : "Create Custom Role"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingRole
                    ? "Update role name and description."
                    : "Set role details and choose permissions for this department."}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">
                      Role name
                    </label>
                    <input
                      placeholder="e.g. Lab Technician"
                      value={newRole.name}
                      onChange={(e) =>
                        setNewRole((p) => ({ ...p, name: e.target.value }))
                      }
                      className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-sm font-medium text-slate-300">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What can this role do?"
                      value={newRole.description}
                      onChange={(e) =>
                        setNewRole((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                      className="px-3.5 py-2.5 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 placeholder:text-slate-600
                             focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {!editingRole && (
                <div className="mt-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Assign permissions
                    </p>
                    <span className="text-xs text-slate-500">
                      {selectedPermissionIds.length} selected
                    </span>
                  </div>

                  {Object.keys(groupedPermissions).length === 0 && (
                    <p className="text-xs text-slate-500">
                      No permissions available.
                    </p>
                  )}

                  {Object.entries(groupedPermissions).map(([group, items]) => (
                    <div
                      key={group}
                      className="rounded-lg border border-white/5 bg-slate-900/30 p-3"
                    >
                      <p className="text-xs font-medium capitalize text-slate-500">
                        {group}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {items.map((permission) => {
                          const active = selectedPermissionIds.includes(
                            permission.id,
                          );

                          return (
                            <button
                              key={permission.id}
                              type="button"
                              onClick={() =>
                                togglePermissionSelection(permission.id)
                              }
                              className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                                active
                                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                              }`}
                              title={permission.description || permission.name}
                            >
                              {permission.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                             text-slate-400 hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                             text-white text-sm font-semibold transition-colors"
              >
                {submitting
                  ? editingRole
                    ? "Saving..."
                    : "Creating..."
                  : editingRole
                    ? "Save changes"
                    : "Create role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
