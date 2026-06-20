import type { Query, QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../../Config/Db.js";
import type {
  createRoleDTO,
  Role,
  RoleRepository,
  RoleWithPermissions,
  updateRoleDTO,
} from "./role.types.js";

export class RoleRepo implements RoleRepository {
  constructor(private db: Database) {}

  async createRole(
    details: createRoleDTO,
    departmentId?: string,
  ): Promise<Role> {
    try {
      let sqlString: string, sqlQuery;

      if (departmentId) {
        sqlString =
          "INSERT INTO role(name,description,department_id) VALUES($1,$2,$3) RETURNING *";
        sqlQuery = await this.db.query(sqlString, [
          details.name,
          details.description,
          departmentId,
        ]);
      } else {
        sqlString =
          "INSERT INTO role(name,description) VALUES($1,$2) RETURNING *";
        sqlQuery = await this.db.query(sqlString, [
          details.name,
          details.description,
        ]);
      }

      if (!sqlQuery) throw new Error("SQL Query error");

      const roleQuery = sqlQuery as QueryResult<Role>,
        createdRole = roleQuery.rows[0];

      return createdRole!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async editRole(roleId: string, newDetails: updateRoleDTO): Promise<Role> {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(newDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlString: string = `UPDATE role SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [roleId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const roleQuery = sqlQuery as QueryResult<Role>,
        patchedRole = roleQuery.rows[0];

      return patchedRole!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRole(roleId: string): Promise<Role> {
    try {
      const sqlString: string = "SELECT * FROM role WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [roleId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const roleQuery = sqlQuery as QueryResult<Role>,
        role = roleQuery.rows[0];

      return role!;
    } catch (error) {
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const sqlString: string = "SELECT * FROM role",
        sqlQuery = await this.db.query(sqlString);

      if (!sqlQuery) throw new Error("SQL Query error");

      const roleQuery = sqlQuery as QueryResult<Role>,
        rolesRetrieved = roleQuery.rows;

      return rolesRetrieved;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions> {
    try {
      const sqlString = `
      SELECT
        r.id               AS "roleId",
        r.role_name        AS "roleName",
        r.role_description AS "roleDescription",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'permissionId', p.id,
              'name',         p.name,
              'description',  p.description,
              'created_at',   p.created_at
            ) ORDER BY p.name
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS permissions
      FROM role r
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions      p  ON p.id = rp.permission_id
      WHERE r.id = $1
      GROUP BY r.id, r.role_name, r.role_description
    `,
        sqlQuery = await this.db.query(sqlString, [roleId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const roleQuery = sqlQuery as QueryResult<RoleWithPermissions>,
        rolesRetrieved = roleQuery.rows[0];

      return rolesRetrieved!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const sqlString: string = "DELETE FROM role WHERE id=$1";

      await this.db.query(sqlString, [roleId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
