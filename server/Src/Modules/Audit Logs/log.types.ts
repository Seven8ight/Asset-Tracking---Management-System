export type Log = {
  id: string;
  department_id: string;
  user_id: string;
  action: string;
  entity_id: string;
  entity_type: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  created_at: string;
};

export type createLogDTO = Omit<
  Log,
  "id" | "created_at" | "department_id" | "user_id"
>;

export interface LogRepository {
  createLog: (
    department_id: string,
    user_id: string,
    newDetails: createLogDTO,
  ) => Promise<Log>;
  getLog: (logId: string) => Promise<Log>;
  getDepartmentLogs: (department_id: string) => Promise<Log[]>;
}

export interface LogService {
  createLog: (
    department_id: string,
    user_id: string,
    newDetails: createLogDTO,
  ) => Promise<Log>;
  getLog: (logId: string) => Promise<Log>;
  getDepartmentLogs: (department_id: string) => Promise<Log[]>;
}
