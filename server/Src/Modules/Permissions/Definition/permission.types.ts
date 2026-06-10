export type Permission = {
  id: string;
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
    permissionDetails: updatePermissionDTO,
  ) => Promise<Permission>;
  getPermission: (permissionId: string) => Promise<Permission>;
  getAllPermission: () => Promise<Permission[]>;
  deletePermission: (permissionId: string) => Promise<void>;
}

/*
 - POS Terminal -> POS Access, apply discount, open drawer, apply discount
 - Inventory and category -> Product Management
 - Credit & Debt Management -> issue credit, collect payment, set credit limits, debt write off
 - Procurement(Suppliers) -> Supply management, manage suppliers, create purchase orders and receiving stock
 - Financials -> Expense Management, record expenses, view reports and manage payment methods
 - User & Access -> User management, manage users, manage roles and assign permissions
 - Branch -> Branch Management, create branch, transfer stock, view branch analytics
 - System & Maintenance - tenant settings, change company name, logo or tax id, audit logs, api access
*/
