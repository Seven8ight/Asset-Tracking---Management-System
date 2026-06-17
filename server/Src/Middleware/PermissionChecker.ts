import type { IncomingMessage } from "node:http";
import { AuthValidator } from "./AuthChecker.js";
import { userRolesServ } from "../Data Objects/DTO.js";

export const PermissionChecker = async (
  request: IncomingMessage,
  permissionName: string,
) => {
  const user = AuthValidator(request),
    userRoles = await userRolesServ.getUserRolesWithPermissions(user.userId);

  const hasPermission = userRoles.roles.some((role) =>
    role.permissions.some((permission) => permission.name == permissionName),
  );

  if (!hasPermission)
    throw new Error("User does not have permission to perform the action");
};
