import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { DATABASE_URL } from "./Env.js";
import { ErrorMsg } from "../Utilities/Logger.js";

export class Database {
  pool: Pool | null = null;

  constructor() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
    });
  }

  async query<T extends QueryResultRow = any>(
    sqlQuery: string,
    values?: any[],
  ): Promise<QueryResult<T>> {
    if (this.pool) {
      const client = await this.pool?.connect();

      try {
        const queryResult = await client.query<T>(sqlQuery, values);

        return queryResult;
      } catch (error) {
        ErrorMsg(error as Error);
        throw error;
      } finally {
        client.release();
      }
    } else throw new Error("Pool is invalid");
  }
}
