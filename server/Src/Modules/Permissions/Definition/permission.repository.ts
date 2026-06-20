import type {
  createPermissionDTO,
  Permission,
  PermissionRepository,
  updatePermissionDTO,
} from "./permission.types.js";
import type { Database } from "../../../Config/Db.js";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { QueryResult } from "pg";

export class PermissionRepo implements PermissionRepository {
  constructor(private db: Database) {}

  async createPermission(
    permissionDetails: createPermissionDTO,
  ): Promise<Permission> {
    try {
      const { name, group_name, description } = permissionDetails;

      const sqlString: string =
          "INSERT INTO permissions(name,group_name,description) VALUES($1,$2,$3) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          name,
          group_name,
          description,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const permissionQuery = sqlQuery as QueryResult<Permission>,
        permissionResult = permissionQuery.rows[0];

      return permissionResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editPermission(
    permissionId: string,
    permissionDetails: updatePermissionDTO,
  ): Promise<Permission> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 1;

      for (let [key, value] of Object.entries(permissionDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlString: string = `UPDATE permissions SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [permissionId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const editQuery = sqlQuery as QueryResult<Permission>,
        permissionResult = editQuery.rows[0];

      return permissionResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getAllPermission(): Promise<Permission[]> {
    try {
      const sqlString: string = "SELECT * FROM permissions",
        sqlQuery = await this.db.query(sqlString);

      if (!sqlQuery) throw new Error("SQL Query error");

      const editQuery = sqlQuery as QueryResult<Permission>,
        permissions = editQuery.rows;

      return permissions!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getPermission(permissionId: string): Promise<Permission> {
    try {
      const sqlString: string = "SELECT * FROM permissions WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [permissionId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const editQuery = sqlQuery as QueryResult<Permission>,
        permission = editQuery.rows[0];

      return permission!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      const sqlQuery: string = "DELETE FROM permissions WHERE id=$1";

      await this.db.query(sqlQuery, [permissionId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
