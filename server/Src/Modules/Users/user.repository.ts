import type { QueryResult } from "pg";
import { ErrorMsg } from "../../Utilities/Logger.js";
import type { Database } from "../../Config/Db.js";
import type { updateUserDTO, User, UserRepository } from "./user.types.js";

export class UserRepo implements UserRepository {
  constructor(private db: Database) {}

  async assignUserToDepartment(
    userId: string,
    departmentId: string,
  ): Promise<User> {
    try {
      const sqlString =
          "UPDATE users SET department_id=$1 WHERE id=$2 RETURNING *",
        sqlQuery = await this.db.query(sqlString, [departmentId, userId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const resultQuery = sqlQuery as QueryResult<User>,
        result = resultQuery.rows[0];

      return result!;
    } catch (error) {
      throw error;
    }
  }

  async switchDepartment(departmentId: string, userId: string): Promise<User> {
    try {
      const sqlString =
          "UPDATE users SET department_id=$1 WHERE id=$2 RETURNING *",
        sqlQuery = await this.db.query(sqlString, [departmentId, userId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const updateQuery = sqlQuery as QueryResult<User>,
        update = updateQuery.rows[0];

      return update!;
    } catch (error) {
      throw error;
    }
  }

  async editUser(userId: string, newDetails: updateUserDTO): Promise<User> {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(newDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const sqlString: string = `UPDATE users SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        queryResult = await this.db.query(sqlString, [userId, ...values]);

      if (!queryResult) throw new Error(`Failed to update user, ${userId}`);

      const sqlQuery: QueryResult<User> = queryResult as QueryResult<User>,
        sqlResult = sqlQuery.rows[0];

      return sqlResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      const sqlString = `SELECT * FROM users WHERE id=$1`,
        queryResult = await this.db.query(sqlString, [userId]);

      if (!queryResult) throw new Error(`Failed to update user, ${userId}`);

      const sqlQuery: QueryResult<User> = queryResult as QueryResult<User>,
        sqlResult = sqlQuery.rows[0];

      return sqlResult!;
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const sqlString = "DELETE FROM users WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [userId]);

      if (!sqlQuery) throw new Error("SQL Query error");
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
