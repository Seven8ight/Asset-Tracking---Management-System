import type { QueryResult } from "pg";
import type { Database } from "../../Config/Db.js";
import type { User } from "../Users/user.types.js";
import type {
  AuthRepository,
  LoginAuth,
  RegistrationAuth,
} from "./authentication.types.js";
import { comparePassword, hashPassword } from "../../Utilities/Hasher.js";

export class AuthenticationRepo implements AuthRepository {
  constructor(private db: Database) {}

  async register(userDetails: RegistrationAuth): Promise<User> {
    try {
      const hashedPassword = hashPassword(userDetails.password);

      const sqlString: string =
          "INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          userDetails.username,
          userDetails.email,
          hashedPassword,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const creationQuery = sqlQuery as QueryResult<User>,
        user = creationQuery.rows[0];

      return user!;
    } catch (error) {
      throw error;
    }
  }

  async login(userDetails: LoginAuth): Promise<User> {
    try {
      const sqlString: string =
          "SELECT * FROM users WHERE email=$1 or username=$2",
        sqlQuery = await this.db.query(sqlString, [
          userDetails.email,
          userDetails.username,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const loginQuery = sqlQuery as QueryResult<User>,
        user = loginQuery.rows[0];

      if (!user || loginQuery.rows.length <= 0)
        throw new Error("User doesn't exist");

      if (!comparePassword(userDetails.password, user!.password))
        throw new Error("Incorrect password");

      return user!;
    } catch (error) {
      throw error;
    }
  }
}
