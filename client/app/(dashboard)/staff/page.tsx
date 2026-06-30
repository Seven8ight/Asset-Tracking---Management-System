"use client";

import { useEffect, useState } from "react";
import { authApi, departmentApi, rolesApi, userRolesApi } from "@/lib/api";
import { useAuth } from "@/app/_lib/context/AuthContext";

interface StaffMember {
  id?: string;
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

type DepartmentUser = {
  id?: string;
  name?: string;
  username?: string;
  email: string;
  role_name?: string;
};

type RoleOption = {
  id: string;
  name: string;
};

type UserRoleWithPermissions = {
  roleId: string;
  roleName: string;
  permissions?: { name: string }[];
};

type UserRolesPermissionsPayload = {
  userId: string;
  roles: UserRoleWithPermissions[];
};

type ApiResponse<T> = {
  response?: {
    message?: T;
  };
};

const DEFAULT_PERMISSIONS: StaffMember["permissions"] = {
  assets: { view: true, edit: false, delete: false },
  staff: { view: false, edit: false },
  reports: { view: true, export: false },
};

const toInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ROLE_STYLES: Record<string, string> = {
  "Asset Manager": "bg-indigo-500/15 text-indigo-400",
  "Support Staff": "bg-emerald-500/15 text-emerald-400",
  "Maintenance Engineer": "bg-amber-500/15 text-amber-400",
  "SaaS Admin": "bg-red-500/15 text-red-400",
};

export default function StaffPage() {
  const { user, permissions, hasPermission } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentName, setDepartmentName] = useState("Your Department");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [rolesReadOnly, setRolesReadOnly] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [inviteForm, setInviteForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
  });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const staffResponse = (await departmentApi.getAllUsers()) as ApiResponse<
        DepartmentUser[]
      >;
      const departmentResponse = user?.department_id
        ? ((await departmentApi.getOne(user.department_id)) as ApiResponse<{
            name?: string;
          }>)
        : null;

      const resolvedDepartmentName =
        departmentResponse?.response?.message?.name ?? "Your Department";

      const mappedStaff = (staffResponse?.response?.message ?? [])
        .filter((member) => member.email !== user?.email)
        .map((member) => {
          const displayName =
            member.name?.trim() ||
            member.username?.trim() ||
            member.email.split("@")[0];
          const primaryRole =
            member.role_name?.split(",")[0]?.trim() || "Member";

          return {
            id: member.id,
            name: displayName,
            email: member.email,
            role: primaryRole,
            dept: resolvedDepartmentName,
            status: "Active" as const,
            initials: toInitials(displayName),
            permissions: { ...DEFAULT_PERMISSIONS },
          };
        });

      setDepartmentName(resolvedDepartmentName);
      setStaff(mappedStaff);
      setError("");
    } catch (err) {
      setError((err as Error).message || "Failed to load staff");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleOptions = async () => {
    try {
      const response = (await rolesApi.getDepartmentRoles()) as ApiResponse<
        RoleOption[]
      >;
      const roles = Array.isArray(response?.response?.message)
        ? response.response!.message!
        : [];

      setRoleOptions(roles);
      setRolesReadOnly(false);

      const supportRole = roles.find((role) => role.name === "Support Staff");
      setInviteForm((prev) => ({
        ...prev,
        role_id: prev.role_id || supportRole?.id || roles[0]?.id || "",
      }));
    } catch {
      const myRolesResponse =
        (await userRolesApi.getMyRolesWithPermissions()) as ApiResponse<UserRolesPermissionsPayload>;
      const myRoles = myRolesResponse?.response?.message?.roles ?? [];
      const fallbackRoles = myRoles
        .map((role) => ({
          id: role.roleId,
          name: role.roleName,
        }))
        .filter((role) => role.name != "SaaS Admin");

      setRoleOptions(fallbackRoles);
      setRolesReadOnly(true);
      setInviteForm((prev) => ({
        ...prev,
        role_id: prev.role_id || fallbackRoles[0]?.id || "",
      }));

      if (fallbackRoles.length === 0) {
        throw new Error("No assignable role found for invitation");
      }
    }
  };

  const ensureInvitePermission = async () => {
    if (hasPermission("Invite users")) return;

    const myRolesResponse =
      (await userRolesApi.getMyRolesWithPermissions()) as ApiResponse<UserRolesPermissionsPayload>;
    const myRoles = myRolesResponse?.response?.message?.roles ?? [];

    const canInvite = myRoles.some((role) =>
      (role.permissions ?? []).some(
        (permission) => permission.name === "Invite users",
      ),
    );

    if (canInvite) return;

    throw new Error(
      "Your account currently does not have Invite users permission. Ask an admin to assign a role with this permission.",
    );
  };

  const openInviteModal = async () => {
    setInviteError("");
    setRolesReadOnly(false);
    setInviteForm({ username: "", email: "", password: "", role_id: "" });
    try {
      await loadRoleOptions();
      setShowInviteModal(true);
    } catch (err) {
      setError((err as Error).message || "Failed to load roles for invitation");
    }
  };

  const inviteStaff = async () => {
    if (!inviteForm.username.trim() || !inviteForm.email.trim()) {
      setInviteError("Name and email are required");
      return;
    }
    if (!inviteForm.password.trim() || inviteForm.password.length < 8) {
      setInviteError("Temporary password must be at least 8 characters");
      return;
    }
    if (!inviteForm.role_id) {
      setInviteError("Please select a role");
      return;
    }

    setInviteLoading(true);
    setInviteError("");

    try {
      try {
        await authApi.invite({
          username: inviteForm.username.trim(),
          email: inviteForm.email.trim(),
          password: inviteForm.password,
          role_id: inviteForm.role_id,
        });
      } catch (err) {
        const message = (err as Error).message.toLowerCase();
        const forbidden = message.includes("forbidden");

        if (!forbidden) throw err;

        await ensureInvitePermission();

        await authApi.invite({
          username: inviteForm.username.trim(),
          email: inviteForm.email.trim(),
          password: inviteForm.password,
          role_id: inviteForm.role_id,
        });
      }

      setShowInviteModal(false);
      await loadStaff();
    } catch (err) {
      setInviteError((err as Error).message || "Failed to invite staff");
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    loadRoleOptions();
    loadStaff();
  }, [user?.department_id]);

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  // Toggle a permission on the selected staff member
  const togglePermission = (
    group: keyof StaffMember["permissions"],
    key: string,
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
            [key]:
              !prev.permissions[group][
                key as keyof (typeof prev.permissions)[typeof group]
              ],
          },
        },
      };
    });
  };

  const saveChanges = async () => {
    if (!selected) return;
    if (!selected.id) {
      setSaveError("Cannot update role: staff user id is missing.");
      return;
    }
    if (selected.id === user?.id) {
      setSaveError("You cannot change your own role.");
      return;
    }

    const nextRole = roleOptions.find((role) => role.name === selected.role);
    if (!nextRole?.id) {
      setSaveError("Please select a valid role.");
      return;
    }

    setSavingChanges(true);
    setSaveError("");
    try {
      await userRolesApi.changeUserRole(selected.id, nextRole.id);
      await loadStaff();
      setSelected(null);
    } catch (err) {
      setSaveError((err as Error).message || "Failed to update staff role");
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Staff
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage department members, roles, and permissions for{" "}
            {departmentName}.
          </p>
        </div>
        <button
          onClick={openInviteModal}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors"
        >
          + Invite Staff
        </button>
      </div>

      <input
        type="text"
        placeholder="Search staff…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3.5 py-2 rounded-lg bg-[#1E293B] border border-white/5
                   text-sm text-slate-200 placeholder:text-slate-500 w-64
                   focus:outline-none focus:border-indigo-500/50"
      />

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[#1E293B] border border-white/5 overflow-x-auto">
        <table className="min-w-140 w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {["Member", "Role", "Department", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold
                             text-slate-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-400" colSpan={5}>
                  Loading staff members...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-400" colSpan={5}>
                  No staff found in this department.
                </td>
              </tr>
            )}

            {filtered.map((s) => (
              <tr
                key={s.email}
                className="border-b border-white/5 last:border-0
                           hover:bg-white/2 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full bg-indigo-500/20 border
                                    border-indigo-500/30 flex items-center justify-center
                                    text-xs font-bold text-indigo-300 shrink-0"
                    >
                      {s.initials}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${ROLE_STYLES[s.role] ?? "bg-slate-500/15 text-slate-400"}`}
                  >
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{s.dept}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium
                    ${s.status === "Active" ? "text-emerald-400" : "text-slate-500"}`}
                  >
                    ● {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSaveError("");
                        setSelected(s);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300
                                 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-400 hover:text-red-300
                                       font-medium transition-colors"
                    >
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
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-[#1E293B]
                          border-l border-white/5 flex flex-col
                          shadow-2xl overflow-y-auto"
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between p-5
                            border-b border-white/5 shrink-0"
            >
              <h2 className="text-sm font-semibold text-slate-100">
                Edit Staff Permissions
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 p-5 flex flex-col gap-6">
              {/* Staff info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-indigo-500/20 border
                                border-indigo-500/30 flex items-center justify-center
                                text-sm font-bold text-indigo-300"
                >
                  {selected.initials}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{selected.name}</p>
                  <p className="text-xs text-slate-500">{selected.email}</p>
                </div>
              </div>

              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold text-slate-400
                                  uppercase tracking-wider"
                >
                  Role
                </label>
                <select
                  value={selected.role}
                  onChange={(e) =>
                    setSelected({ ...selected, role: e.target.value })
                  }
                  className="px-3 py-2 rounded-lg bg-[#0F172A] border border-white/5
                             text-sm text-slate-200 focus:outline-none
                             focus:border-indigo-500/50"
                >
                  {roleOptions.length === 0 ? (
                    <option>{selected.role}</option>
                  ) : (
                    roleOptions.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {saveError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {saveError}
                </div>
              )}

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
            <div className="flex shrink-0 gap-3 border-t border-white/5 p-5">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm
                           text-slate-400 hover:text-slate-200 hover:border-white/20
                           transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                disabled={savingChanges}
                className="flex-1 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600
                           text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {savingChanges ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#1E293B] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                Invite Staff
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                placeholder="Full name"
                value={inviteForm.username}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="rounded-lg border border-white/5 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200"
              />
              <input
                placeholder="Email"
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="rounded-lg border border-white/5 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200"
              />
              <input
                placeholder="Temporary password"
                type="password"
                value={inviteForm.password}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="rounded-lg border border-white/5 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200"
              />
              <select
                value={inviteForm.role_id}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    role_id: e.target.value,
                  }))
                }
                disabled={rolesReadOnly}
                className="rounded-lg border border-white/5 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-200"
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              {rolesReadOnly && (
                <p className="text-xs text-amber-300">
                  Role selection is limited to your current roles because your
                  account cannot list all department roles.
                </p>
              )}

              {inviteError && (
                <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {inviteError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={inviteStaff}
                  disabled={inviteLoading}
                  className="flex-1 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {inviteLoading ? "Inviting..." : "Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable permission group component
function PermissionGroup({
  label,
  items,
  values,
  onChange,
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
          <label
            key={item.key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={values[item.key] ?? false}
              onChange={() => onChange(item.key)}
              className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
            />
            <span
              className="text-sm text-slate-400 group-hover:text-slate-200
                             transition-colors"
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
