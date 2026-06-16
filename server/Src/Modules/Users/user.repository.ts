import type { QueryResult } from "pg";
import { ErrorMsg } from "../../Utilities/Logger.js";
import type { Database } from "../../Config/Db.js";
import type { updateUserDTO, User, UserRepository } from "./user.types.js";

export class UserRepo implements UserRepository {
  constructor(private db: Database) {}

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

  async deleteUser(department_id: string, userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.editUser(userId, {
        deleted_at: date.toUTCString(),
      });
    } catch (error) {
      ErrorMsg(error as Error);
      throw error;
    }
  }
}
