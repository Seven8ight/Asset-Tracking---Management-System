import type { Permission } from "../../Permissions/Definition/permission.types.js";

export type Role = {
  id: string;
  name: string;
  description: string;
  department_id: string;
};

export type createRoleDTO = Omit<Role, "id" | "department_id">;
export type updateRoleDTO = Partial<Omit<Role, "id">>;

export type RoleWithPermissions = {
  departmentId: string;
  roleId: string;
  roleName: string;
  roleDescription: string | null;
  permissions: Permission[];
};

export interface RoleRepository {
  createRole: (details: createRoleDTO, departmentId?: string) => Promise<Role>;
  editRole: (roleId: string, newDetails: updateRoleDTO) => Promise<Role>;
  getRole: (roleId: string) => Promise<Role>;
  getDepartmentRoles: (departmentId: string) => Promise<Role[]>;
  getRoles: () => Promise<Role[]>;
  deleteRole: (roleId: string) => Promise<void>;
  getRoleWithPermissions: (roleId: string) => Promise<RoleWithPermissions>;
}
export interface RoleService {
  createRole: (details: createRoleDTO, departmentId?: string) => Promise<Role>;
  editRole: (roleId: string, newDetails: updateRoleDTO) => Promise<Role>;
  getRole: (roleId: string) => Promise<Role>;
  getDepartmentRoles: (departmentId: string) => Promise<Role[]>;
  getRoles: () => Promise<Role[]>;
  deleteRole: (roleId: string) => Promise<void>;
  getRoleWithPermissions: (roleId: string) => Promise<RoleWithPermissions>;
}
