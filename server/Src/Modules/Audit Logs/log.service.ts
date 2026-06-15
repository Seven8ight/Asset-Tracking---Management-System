import type {
  createLogDTO,
  Log,
  LogRepository,
  LogService,
} from "./log.types.js";

export class LogServ implements LogService {
  constructor(private repo: LogRepository) {}

  async createLog(
    department_id: string,
    user_id: string,
    newDetails: createLogDTO,
  ): Promise<Log> {
    try {
      if (!department_id || !user_id || !newDetails)
        throw new Error(
          "Department id, branch id, user id and log details must be provided",
        );

      const allowedFields: (keyof createLogDTO)[] = [
        "action",
        "entity_id",
        "entity_type",
        "new_values",
        "old_values",
      ];

      let filteredLogValues: Record<string, any> = {};
      for (const key of allowedFields) {
        const value = newDetails[key as keyof createLogDTO];

        if (value === undefined || value == null)
          throw new Error(`${key} has an invalid value`);

        filteredLogValues[key] = value;
      }

      const insertionLog = await this.repo.createLog(
        department_id,
        user_id,
        filteredLogValues as createLogDTO,
      );

      return insertionLog;
    } catch (error) {
      throw error;
    }
  }

  async getLog(logId: string): Promise<Log> {
    try {
      if (!logId) throw new Error("Log id must be provided");

      const log = await this.repo.getLog(logId);

      return log;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentLogs(department_id: string): Promise<Log[]> {
    try {
      if (!department_id) throw new Error("Branch id must be provided");

      const branchLogs = await this.repo.getDepartmentLogs(department_id);

      return branchLogs;
    } catch (error) {
      throw error;
    }
  }
}
