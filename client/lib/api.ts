const BASE_URL = "http://localhost:3001";

// Gets the access token from localStorage
export const getToken = (): string | null =>
  localStorage.getItem("accessToken");

// Saves tokens after login/register
export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

// Clears tokens on logout
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Decodes the JWT payload without a library
export const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Core fetch wrapper — attaches auth header and handles errors
export const apiFetch = async (
  path: string,
  options: RequestInit = {}
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
    throw new Error(data?.message ?? "Something went wrong");
  }

  return data;
};

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (body: { username: string; email: string; password: string }) =>
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email?: string; username?: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  refresh: (refresh_token: string) =>
    apiFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  invite: (body: { username: string; email: string; password: string }) =>
    apiFetch("/auth/invite", { method: "POST", body: JSON.stringify(body) }),
};

// ── Departments ───────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch("/department/all"),

  getOne: (id: string) => apiFetch(`/department/${id}`),

  create: (body: { name: string; description: string }) =>
    apiFetch("/department", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Partial<{ name: string; description: string }>) =>
    apiFetch(`/department/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch(`/department/${id}`, { method: "DELETE" }),
};

// ── Assets ────────────────────────────────────────────────
export const assetApi = {
  getDepartmentAssets: () => apiFetch("/asset/department"),

  getOne: (id: string) => apiFetch(`/asset/${id}`),

  create: (body: {
    name: string;
    description?: string;
    status: string;
    quantity: number;
    image?: string;
  }) =>
    apiFetch("/asset", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: Record<string, any>) =>
    apiFetch(`/asset/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  delete: (id: string) =>
    apiFetch(`/asset/${id}`, { method: "DELETE" }),
};

// ── Users ─────────────────────────────────────────────────
export const userApi = {
  getMe: () => apiFetch("/users"),

  update: (body: Partial<{ name: string; email: string; phone: string }>) =>
    apiFetch("/users", { method: "PATCH", body: JSON.stringify(body) }),

  delete: () => apiFetch("/users", { method: "DELETE" }),
};

// ── Roles ─────────────────────────────────────────────────
export const roleApi = {
  getDepartmentRoles: () => apiFetch("/roles/department"),
  getAll: () => apiFetch("/roles/all"),
  getRoleWithPermissions: (roleId: string) =>
    apiFetch(`/roles/permissions/${roleId}`),
  create: (body: { name: string; description?: string }) =>
    apiFetch("/roles", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; description?: string }) =>
    apiFetch(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch(`/roles/${id}`, { method: "DELETE" }),
};

// ── Permissions ───────────────────────────────────────────
export const permissionApi = {
  getAll: () => apiFetch("/permissions/all"),
  getOne: (id: string) => apiFetch(`/permissions/${id}`),
  create: (body: { name: string; description?: string }) =>
    apiFetch("/permissions", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: { name?: string; description?: string }) =>
    apiFetch(`/permissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    apiFetch(`/permissions/${id}`, { method: "DELETE" }),
};

// ── Role Permissions ──────────────────────────────────────
export const rolePermissionApi = {
  getRolePermissions: (roleId: string) =>
    apiFetch(`/rolepermissions/${roleId}`),
  assign: (role_id: string, permission_id: string) =>
    apiFetch("/rolepermissions", {
      method: "POST",
      body: JSON.stringify({ role_id, permission_id }),
    }),
  remove: (roleId: string, permissionId: string) =>
    apiFetch(`/rolepermissions/${roleId}/${permissionId}`, {
      method: "DELETE",
    }),
};

// ── User Roles ────────────────────────────────────────────
export const userRoleApi = {
  getMyRoles: () => apiFetch("/userroles"),
  getMyRolesWithPermissions: () => apiFetch("/userroles/permissions"),
  assign: (roleId: string) =>
    apiFetch(`/userroles/${roleId}`, { method: "POST" }),
  remove: (roleId: string) =>
    apiFetch(`/userroles/${roleId}`, { method: "DELETE" }),
};

// ── Audit Logs ────────────────────────────────────────────
export const auditApi = {
  getDepartmentLogs: () => apiFetch("/audit/department"),
  getAll: () => apiFetch("/audit/all"),
  getOne: (id: string) => apiFetch(`/audit/${id}`),
};

// ── Assignments (asset ownership) ─────────────────────────
export const assignmentApi = {
  getDepartmentAssignments: () => apiFetch("/assignments/department"),
  getOne: (id: string) => apiFetch(`/assignments/${id}`),
  assign: (assetId: string) =>
    apiFetch(`/assignments/${assetId}`, { method: "POST" }),
  edit: (id: string, body: Record<string, any>) =>
    apiFetch(`/assignments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};