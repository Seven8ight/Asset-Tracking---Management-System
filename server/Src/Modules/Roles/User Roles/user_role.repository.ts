import type { QueryResult } from "pg";
import { ErrorMsg } from "../../../Utilities/Logger.js";
import type { Database } from "../../../Config/Db.js";
import type {
  UserRole,
  UserRoleRepository,
  UserSpecificRoles,
  UserSpecificRolesWithPermissions,
} from "./user_role.types.js";

export class UserRoleRepo implements UserRoleRepository {
  constructor(private db: Database) {}

  async createUserRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      const sqlString = `INSERT INTO user_roles(user_id,role_id) VALUES($1,$2) RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [userId, roleId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const sqlResult = sqlQuery as QueryResult<UserRole>,
        createdUserRole = sqlResult.rows[0];

      return createdUserRole!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserSpecificRoles> {
    try {
      const sqlString = `SELECT r.name FROM user_roles ur INNER JOIN role r ON ur.role_id=r.id WHERE ur.user_id=$1`,
        sqlQuery = await this.db.query(sqlString, [userId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const getUserRoleResult = sqlQuery as QueryResult<UserSpecificRoles>,
        getUserRoles = getUserRoleResult.rows;

      return {
        userId: userId,
        roles: getUserRoles as any,
      };
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUserRolesWithPermissions(
    userId: string,
  ): Promise<UserSpecificRolesWithPermissions> {
    const sqlString = `
      SELECT
        r.id                AS "roleId",
        r.name         AS "roleName",
        r.description  AS "roleDescription",
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'permissionId', p.id,
              'name',         p.name,
              'description',  p.description
            ) ORDER BY p.name
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS permissions
      FROM user_roles ur
      JOIN role             r  ON r.id  = ur.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions      p  ON p.id = rp.permission_id
      WHERE ur.user_id = $1
      GROUP BY r.id, r.name, r.description
      ORDER BY r.name
    `,
      sqlQuery = await this.db.query(sqlString, [userId]);

    if (!sqlQuery) throw new Error("SQL Query error");

    const getUserRoleResult = sqlQuery as QueryResult<UserSpecificRoles>,
      getUserRoles = getUserRoleResult.rows;

    return {
      userId: userId,
      roles: getUserRoles as any,
    };
  }

  async deleteUserRole(userId: string, roleId: string): Promise<void> {
    try {
      const sqlQuery = `DELETE FROM user_roles WHERE user_id=$1 AND role_id=$2`;

      await this.db.query(sqlQuery, [userId, roleId]);
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
