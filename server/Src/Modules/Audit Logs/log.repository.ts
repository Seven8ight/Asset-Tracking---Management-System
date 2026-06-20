import type { QueryResult } from "pg";
import type { Database } from "../../Config/Db.js";
import type { createLogDTO, Log, LogRepository } from "./log.types.js";

export class LogRepo implements LogRepository {
  constructor(private db: Database) {}

  async createLog(
    department_id: string,
    user_id: string,
    newDetails: createLogDTO,
  ): Promise<Log> {
    try {
      const sqlString: string =
          "INSERT INTO audit_logs(department_id,user_id,action,entity_id,entity_type,old_values,new_values) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          department_id,
          user_id,
          newDetails.action,
          newDetails.entity_id,
          newDetails.entity_type,
          JSON.stringify(newDetails.old_values),
          JSON.stringify(newDetails.new_values),
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const logAuditQuery = sqlQuery as QueryResult<Log>,
        auditedLog = logAuditQuery.rows[0];

      return auditedLog!;
    } catch (error) {
      throw error;
    }
  }

  async getLog(logId: string): Promise<Log> {
    try {
      const sqlString: string = "SELECT * FROM audit_logs WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [logId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieveLogQuery = sqlQuery as QueryResult<Log>,
        retrievedLog = retrieveLogQuery.rows[0];

      return retrievedLog!;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentLogs(department_id: string): Promise<Log[]> {
    try {
      const sqlString: string =
          "SELECT * FROM audit_logs WHERE department_id=$1",
        sqlQuery = await this.db.query(sqlString, [department_id]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieveBranchLogQuery = sqlQuery as QueryResult<Log>,
        retrievedBranchLogs = retrieveBranchLogQuery.rows;

      return retrievedBranchLogs;
    } catch (error) {
      throw error;
    }
  }

  async getLogs(): Promise<Log[]> {
    try {
      const sqlString = "SELECT * FROM audit_logs",
        sqlQuery = await this.db.query(sqlString, []);

      if (!sqlQuery) throw new Error("SQL Query error");

      const allLogsQuery = sqlQuery as QueryResult<Log>,
        allLogs = allLogsQuery.rows;

      return allLogs;
    } catch (error) {
      throw error;
    }
  }
}
