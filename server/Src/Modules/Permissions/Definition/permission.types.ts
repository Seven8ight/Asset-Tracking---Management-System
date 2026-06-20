export type Permission = {
  id: string;
  group_name: string;
  name: string;
  description: string;
  created_at: string;
};

export type createPermissionDTO = Omit<Permission, "id" | "created_at">;
export type updatePermissionDTO = Partial<
  Omit<Permission, "id" | "created_at">
>;

export interface PermissionRepository {
  createPermission: (
    permissionDetails: createPermissionDTO,
  ) => Promise<Permission>;
  editPermission: (
    permissionId: string,
    permissionDetails: updatePermissionDTO,
  ) => Promise<Permission>;
  getPermission: (permissionId: string) => Promise<Permission>;
  getAllPermission: () => Promise<Permission[]>;
  deletePermission: (permissionId: string) => Promise<void>;
}
export interface PermissionServ {
  createPermission: (
    permissionDetails: createPermissionDTO,
  ) => Promise<Permission>;
  editPermission: (
    permissionId: string,
    permissionDetails: updatePermissionDTO,
  ) => Promise<Permission>;
  getPermission: (permissionId: string) => Promise<Permission>;
  getAllPermission: () => Promise<Permission[]>;
  deletePermission: (permissionId: string) => Promise<void>;
}
