import { Warning } from "../../../Utilities/Logger.js";
import type {
  createRoleDTO,
  Role,
  RoleRepository,
  RoleService,
  RoleWithPermissions,
  updateRoleDTO,
} from "./role.types.js";

export class Roleservice implements RoleService {
  constructor(private repo: RoleRepository) {}

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

      const createRole = await this.repo.createRole(details, departmentId);

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

      for (let key of allowedFields) {
        const value = newDetails[key];

        if (value == undefined || value == null) continue;

        validDetails[key] = value;
      }

      if (Object.keys(validDetails).length == 0)
        throw new Error("No valid details to update");

      const updateQuery = await this.repo.editRole(roleId, validDetails);
      return updateQuery;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async getRole(roleId: string): Promise<Role> {
    try {
      if (!roleId) throw new Error("Role id must be provided");

      const role = await this.repo.getRole(roleId);

      return role;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentRoles(departmentId: string): Promise<Role[]> {
    try {
      if (!departmentId) throw new Error("Department id must be provided");

      const allDepartmentRoles =
        await this.repo.getDepartmentRoles(departmentId);

      return allDepartmentRoles;
    } catch (error) {
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const retrieveRoles = await this.repo.getRoles();
      return retrieveRoles;
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions> {
    try {
      if (!roleId) throw new Error("Role id must be provided");

      const rolePermissions: RoleWithPermissions =
        await this.repo.getRoleWithPermissions(roleId);

      return rolePermissions;
    } catch (error) {
      Warning("Error at retrieving role with permis");
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      if (!roleId) throw new Error("Role id not provided");

      await this.repo.deleteRole(roleId);
    } catch (error) {
      Warning("Error occured at create role");
      throw error;
    }
  }
}
