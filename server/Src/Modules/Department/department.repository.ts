import type { QueryResult } from "pg";
import type { Database } from "../../Config/Db.js";
import type {
  createDepartmentDTO,
  Department,
  DepartmentRepository,
  updateDepartmentDTO,
} from "./department.types.js";
import type { User } from "../Users/user.types.js";

export class DepartmentRepo implements DepartmentRepository {
  constructor(private db: Database) {}

  async createDepartment(
    departmentDetails: createDepartmentDTO,
  ): Promise<Department> {
    try {
      const sqlString: string = `INSERT INTO departments(name,description,color) VALUES($1,$2,$3) RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [
          departmentDetails.name,
          departmentDetails.description,
          departmentDetails.color,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const creationQuery = sqlQuery as QueryResult<Department>,
        createdDepartment = creationQuery.rows[0];

      return createdDepartment!;
    } catch (error) {
      throw error;
    }
  }

  async editDepartment(
    departmentId: string,
    newDepartmentDetails: updateDepartmentDTO,
  ): Promise<Department> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (const key in newDepartmentDetails) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(newDepartmentDetails[key as keyof updateDepartmentDTO]);
      }

      const sqlString: string = `UPDATE departments SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [departmentId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const patchQuery = sqlQuery as QueryResult<Department>,
        patchedDepartment = patchQuery.rows[0];

      return patchedDepartment!;
    } catch (error) {
      throw error;
    }
  }

  async getDepartment(departmentId: string): Promise<Department> {
    try {
      const sqlString: string = `SELECT * FROM departments WHERE id=$1`,
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentQuery = sqlQuery as QueryResult<Department>,
        department = departmentQuery.rows[0];

      return department!;
    } catch (error) {
      throw error;
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    try {
      const sqlString: string = `SELECT * FROM departments`,
        sqlQuery = await this.db.query(sqlString);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentsQuery = sqlQuery as QueryResult<Department>,
        departments = departmentsQuery.rows;

      return departments;
    } catch (error) {
      throw error;
    }
  }

  async getUsersInDepartments(departmentId: string) {
    try {
      const sqlString: string = `SELECT * FROM users WHERE department_id=$1`,
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const usersInDepartmentQuery = sqlQuery as QueryResult<User>,
        usersInDepartment = usersInDepartmentQuery.rows[0];

      return usersInDepartment;
    } catch (error) {
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      const sqlString: string = `DELETE FROM departments WHERE id=$1`,
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");
    } catch (error) {
      throw error;
    }
  }
}
