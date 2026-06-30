import { ServerAPI } from "@/app/_lib/constants/globals";
import { getToken } from "./token";

const BASE_URL = ServerAPI;

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("accessToken", accessToken);
  window.localStorage.setItem("refreshToken", refreshToken);
};

// Clears tokens on logout
export const clearTokens = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
};

// Decodes the JWT payload without a library
export const decodeToken = async <T = any>(token: string): Promise<T> => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(
      data?.response?.message ?? data?.message ?? "Error decoding token",
    );

  return data.response.message as T;
};

// Core fetch wrapper — attaches auth header and handles errors
export const apiFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<any> => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.response?.message ?? data?.message ?? "Something went wrong",
    );
  }

  return data;
};

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (body: { username: string; email: string; password: string }) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email?: string; username?: string; password: string }) =>
    apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  refresh: (refresh_token: string) =>
    apiFetch("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  resetPassword: (email: string) =>
    apiFetch(`/api/auth/passwordreset`, {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
    }),

  invite: (body: {
    username: string;
    email: string;
    password: string;
    role_id: string;
  }) =>
    apiFetch("/api/auth/invite", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
// ── Departments ───────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch("/api/department/all"),

  getAllUsers: () => apiFetch("/api/department/allusers"),

  getOne: (id: string) => apiFetch(`/api/department/${id}`),

  create: (body: { name: string; description: string; color: string }) =>
    apiFetch("/api/department", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (
    id: string,
    body: Partial<{ name: string; description: string; color: string }>,
  ) =>
    apiFetch(`/api/department/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch(`/api/department/${id}`, { method: "DELETE" }),
};

// ── Assets ────────────────────────────────────────────────
export const assetApi = {
  getDepartmentAssets: () => apiFetch("/api/asset/department"),

  getOne: (id: string) => apiFetch(`/api/asset/${id}`),

  create: (body: {
    name: string;
    description: string;
    quantity: number;
    image?: string;
  }) => apiFetch("/api/asset", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Record<string, any>) =>
    apiFetch(`/api/asset/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) => apiFetch(`/api/asset/${id}`, { method: "DELETE" }),
};

export const individualAssetApi = {
  getByAssetId: (assetId: string) =>
    apiFetch(`/api/individualassets/${assetId}`),

  update: (individualAssetId: string, body: Record<string, any>) =>
    apiFetch(`/api/individualassets/${individualAssetId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

export const assignmentsApi = {
  getDepartmentAssignments: () => apiFetch("/api/assignments/department"),

  getByIndividualAssetId: (individualAssetId: string) =>
    apiFetch(`/api/assignments/${individualAssetId}`),

  assignToSelf: (individualAssetId: string) =>
    apiFetch(`/api/assignments/${individualAssetId}`, {
      method: "POST",
    }),

  returnToPool: (assignmentId: string, returned_at: string) =>
    apiFetch(`/api/assignments/${assignmentId}`, {
      method: "PATCH",
      body: JSON.stringify({ returned_at }),
    }),
};

// ── Roles ─────────────────────────────────────────────────
export const rolesApi = {
  getDepartmentRoles: () => apiFetch("/api/roles/department"),

  getRolePermissions: (roleId: string) =>
    apiFetch(`/api/roles/permissions/${roleId}`),

  createRole: (body: { name: string; description: string }) =>
    apiFetch("/api/roles", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateRole: (roleId: string, body: { name?: string; description?: string }) =>
    apiFetch(`/api/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteRole: (roleId: string) =>
    apiFetch(`/api/roles/${roleId}`, {
      method: "DELETE",
    }),
};

export const permissionsApi = {
  getAll: () => apiFetch("/api/permissions/all"),
};

export const rolePermissionsApi = {
  assignToRole: (body: { role_id: string; permission_id: string | string[] }) =>
    apiFetch("/api/rolepermissions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ── User Roles ───────────────────────────────────────────
export const userRolesApi = {
  getMyRoles: () => apiFetch("/api/userroles"),

  getMyRolesWithPermissions: () => apiFetch("/api/userroles/permissions"),

  assignMyRole: (roleId: string) =>
    apiFetch(`/api/userroles/${roleId}`, {
      method: "POST",
    }),

  changeUserRole: (userId: string, roleId: string) =>
    apiFetch(`/api/userroles/${userId}/${roleId}`, {
      method: "PATCH",
    }),
};

// ── Users ─────────────────────────────────────────────────
export const userApi = {
  getMe: (userId: string) => apiFetch(`/api/users/${userId}`),

  update: (
    body: Partial<{
      username: string;
      email: string;
      phone: string;
      password: string;
    }>,
  ) => apiFetch("/api/users", { method: "PATCH", body: JSON.stringify(body) }),

  switch: (departmentId: string) =>
    apiFetch(`/api/users/switch/${departmentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        username: "hello",
      }),
    }),

  delete: () => apiFetch("/api/users", { method: "DELETE" }),
};

// ── Audit Logs ───────────────────────────────────────────
export const auditApi = {
  getDepartmentLogs: () => apiFetch("/api/audit/department"),

  getAllLogs: () => apiFetch("/api/audit/all"),

  getOne: (id: string) => apiFetch(`/api/audit/${id}`),
};
