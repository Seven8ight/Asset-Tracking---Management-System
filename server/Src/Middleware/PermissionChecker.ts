import type { IncomingMessage } from "node:http";
import { AuthValidator } from "./AuthChecker.js";
import { userRolesServ } from "../Data Objects/DTO.js";

export type PermissionGroup =
  | "department"
  | "users"
  | "assets"
  | "individual asset"
  | "audit"
  | "asset assignment"
  | "permissions";

export type PermissionName =
  // Department
  | "Department creation"
  | "Department update"
  | "View department users"
  | "View all departments"
  | "Department deletion"

  // Users
  | "Invite users"
  | "Manage user roles"
  | "View all department users"

  // Assets
  | "Create assets"
  | "Edit assets"
  | "View department asset"
  | "Delete a department asset"

  // Individual Asset
  | "Declare asset broken"
  | "Declare asset repaired"
  | "Delete an individual asset"

  //Asset assignments
  | "View an assignment"
  | "View departmental assignments"
  | "Assign asset to self"

  // Audit
  | "View all logs"
  | "View departmental logs"
  | "View log"

  //Permissions
  | "View permissions"
  | "Create a permission"
  | "Edit a permission"
  | "Delete a permission";

export const PermissionChecker = async (
  request: IncomingMessage,
  permissionGroup: PermissionGroup,
  permissionName: PermissionName,
): Promise<void> => {
  const user = AuthValidator(request);

  const userRoles = await userRolesServ.getUserRolesWithPermissions(
    user.userId,
  );

  const hasPermission = userRoles.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        permission.group_name.trim() === permissionGroup.trim() &&
        permission.name.trim() === permissionName.trim(),
    ),
  );

  if (!hasPermission) {
    throw new Error("Forbidden: user does not have permission");
  }
};
