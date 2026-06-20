import type { QueryResult } from "pg";
import type { Database } from "../../Config/Db.js";
import type {
  createDepartmentDTO,
  Department,
  departmentmember,
  DepartmentRepository,
  FullDepartmentDetails,
  updateDepartmentDTO,
} from "./department.types.js";

export class DepartmentRepo implements DepartmentRepository {
  constructor(private db: Database) {}

  async createDepartment(
    manager_id: string,
    departmentDetails: createDepartmentDTO,
  ): Promise<Department> {
    try {
      const sqlString: string = `INSERT INTO departments(name,description,color,manager_id) VALUES($1,$2,$3,$4) RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [
          departmentDetails.name,
          departmentDetails.description,
          departmentDetails.color,
          manager_id,
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

  async getDepartment(departmentId: string): Promise<FullDepartmentDetails> {
    try {
      const sqlString: string = `SELECT d.*,u.username as manager_name FROM departments d JOIN users u ON d.manager_id=u.id WHERE d.id=$1`,
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentQuery = sqlQuery as QueryResult<FullDepartmentDetails>,
        department = departmentQuery.rows[0];

      return department!;
    } catch (error) {
      throw error;
    }
  }

  async getAllDepartments(): Promise<FullDepartmentDetails[]> {
    try {
      const sqlString: string = `SELECT d.*,u.username as manager_name FROM departments d JOIN users u ON d.manager_id=u.id`,
        sqlQuery = await this.db.query(sqlString);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentsQuery = sqlQuery as QueryResult<FullDepartmentDetails>,
        departments = departmentsQuery.rows;

      return departments;
    } catch (error) {
      throw error;
    }
  }

  async getUsersInDepartments(
    departmentId: string,
  ): Promise<departmentmember[]> {
    try {
      const sqlString: string = `SELECT name,email FROM users WHERE department_id=$1`,
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const usersInDepartmentQuery = sqlQuery as QueryResult<departmentmember>,
        usersInDepartment = usersInDepartmentQuery.rows;

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
