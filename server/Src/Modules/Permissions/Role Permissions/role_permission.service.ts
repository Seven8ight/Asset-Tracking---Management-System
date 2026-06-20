import { Warning } from "../../../Utilities/Logger.js";
import type {
  RolePermission,
  RolepermissionRepository,
  RolepermissionService,
} from "./role_permission.types.js";

export class RolePermissionServ implements RolepermissionService {
  constructor(private RPRepo: RolepermissionRepository) {}

  async createRPermission(
    roleId: string,
    permissionId: string | string[],
  ): Promise<RolePermission> {
    try {
      if (!roleId || !permissionId)
        throw new Error("role id and permission id must be provided");

      let rolePermissionCreation: any;

      if (typeof permissionId == "string")
        rolePermissionCreation = await this.RPRepo.createRPermission(
          roleId,
          permissionId,
        );
      else {
        for (let permission of permissionId) {
          rolePermissionCreation = await this.RPRepo.createRPermission(
            roleId,
            permission,
          );
        }
      }

      return rolePermissionCreation;
    } catch (error) {
      Warning(`Error at role creation permission`);
      throw error;
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    try {
      if (!roleId) throw new Error("User id must be provided");

      const userPRetrieval = await this.RPRepo.getRolePermissions(roleId);

      return userPRetrieval;
    } catch (error) {
      Warning(`Error at getting role permission`);
      throw error;
    }
  }

  async deleteRolePermissions(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      if (!roleId || !permissionId)
        throw new Error("Role id and permission id must be provided");

      await this.RPRepo.deleteRolePermissions(roleId, permissionId);
    } catch (error) {
      Warning(`Error at deleting role permission`);
      throw error;
    }
  }
}
