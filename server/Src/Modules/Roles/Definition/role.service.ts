import { Warning } from "../../../Utilities/Logger.js";
import type { createAssetDTO } from "../../Assets/Definition/asset.types.js";
import type {
  createRoleDTO,
  Role,
  RoleRepository,
  RoleService,
  RoleWithPermissions,
  updateRoleDTO,
} from "./role.types.js";

export class Roleservice implements RoleService {
  constructor(private roleRepo: RoleRepository) {}

  async createRole(
    details: createRoleDTO,
    departmentId?: string,
  ): Promise<Role> {
    try {
      if (details.name.length <= 0 || details.description.length <= 0)
        throw new Error("Name and description length invalid");

      const allowedFields: (keyof createRoleDTO)[] = ["name", "description"];

      for (let key of allowedFields) {
        const value = details[key];

        if (value == null || value == undefined)
          throw new Error(`${key} has an invalid value`);
      }

      const createRole = await this.roleRepo.createRole(details, departmentId);

      return createRole;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async editRole(roleId: string, newDetails: updateRoleDTO): Promise<Role> {
    try {
      if (!roleId) throw new Error("Role id not provided");

      let validDetails: Record<string, any> = {},
        allowedFields: (keyof updateRoleDTO)[] = ["name", "description"];

      let filteredDetails: Record<string, any> = {};
      for (let key of allowedFields) {
        const value = newDetails[key];

        if (value == undefined || value == null) continue;

        filteredDetails[key] = value;
      }

      if (Object.keys(validDetails).length == 0)
        throw new Error("No valid details to update");

      const updateQuery = await this.roleRepo.editRole(roleId, newDetails);
      return updateQuery;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async getRole(roleId: string): Promise<Role> {
    try {
      if (!roleId) throw new Error("Role id must be provided");

      const role = await this.roleRepo.getRole(roleId);

      return role;
    } catch (error) {
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const retrieveRoles = await this.roleRepo.getRoles();
      return retrieveRoles;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions> {
    try {
      const rolePermissions: RoleWithPermissions =
        await this.roleRepo.getRoleWithPermissions(roleId);

      return rolePermissions;
    } catch (error) {
      Warning("Error at retrieving role with permis");
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      if (!roleId) throw new Error("Role id not provided");

      await this.roleRepo.deleteRole(roleId);
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }
}
