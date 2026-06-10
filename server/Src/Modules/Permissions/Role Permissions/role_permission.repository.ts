import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../../Config/Db.js";
import type {
  RolePermission,
  RolepermissionRepository,
} from "./role_permission.types.js";

export class RolePermissionRepo implements RolepermissionRepository {
  constructor(private db: Database) {}

  async createRPermission(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission> {
    try {
      const sqlString: string = `INSERT INTO role_permissions(role_id,permission_id) VALUES($1,$2) RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [roleId, permissionId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const sqlResult = sqlQuery as QueryResult<RolePermission>,
        rolePermission = sqlResult.rows[0];

      return rolePermission!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    try {
      const sqlString: string = `SELECT p.* FROM role_permissions rp 
          INNER JOIN permissions p ON rp.permission_id = p.id 
          WHERE rp.role_id = $1`,
        sqlQuery = await this.db.query(sqlString, [roleId]);
      if (!sqlQuery) throw new Error("SQL Query error");

      const sqlResult = sqlQuery as QueryResult<RolePermission>,
        rolePermissions = sqlResult.rows;

      return rolePermissions!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRolePermissions(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const sqlQuery: string = `DELETE FROM role_permissions WHERE role_id=$1 AND permission_id=$2`;

      await this.db.query(sqlQuery, [roleId, permissionId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
