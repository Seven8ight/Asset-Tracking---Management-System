import type { QueryResult } from "pg";
import type { Database } from "../../../Config/Db.js";
import type {
  AssetAssignments,
  AssetAssignmentsRepository,
  AssetAssignmentsResponse,
  updateAssignmentDTO,
} from "./asset_assignment.types.js";

export class AssetAssignmentRepo implements AssetAssignmentsRepository {
  constructor(private db: Database) {}

  async assignAsset(
    assetId: string,
    departmentId: string,
    userId: string,
  ): Promise<AssetAssignments> {
    try {
      const date = new Date();

      const sqlString =
          "INSERT INTO asset_assignments(department_id,asset_id,user_id,assigned_at) VALUES($1,$2,$3,$4) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          departmentId,
          assetId,
          userId,
          date.toUTCString(),
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const assignmentQuery = sqlQuery as QueryResult<AssetAssignments>,
        assignment = assignmentQuery.rows[0];

      return assignment!;
    } catch (error) {
      throw error;
    }
  }

  async editAssignment(
    assignmentId: string,
    newAssignmentDetails: updateAssignmentDTO,
    userId: string,
  ): Promise<AssetAssignments> {
    try {
      const sqlString: string =
          "UPDATE asset_assignments SET returned_at=$2 WHERE id=$1 AND user_id=$3 RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          assignmentId,
          newAssignmentDetails.returned_at,
          userId,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const patchedAssignmentQuery = sqlQuery as QueryResult<AssetAssignments>,
        patchedAssignment = patchedAssignmentQuery.rows[0];

      if (!patchedAssignment)
        throw new Error("You can only return assignments assigned to you");

      return patchedAssignment!;
    } catch (error) {
      throw error;
    }
  }

  async getAssignments(assetId: string): Promise<AssetAssignmentsResponse[]> {
    try {
      const sqlString: string =
          "SELECT aa.*,u.username FROM asset_assignments aa JOIN users u ON aa.user_id=u.id WHERE aa.asset_id=$1",
        sqlQuery = await this.db.query(sqlString, [assetId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const assingmentsQuery =
          sqlQuery as QueryResult<AssetAssignmentsResponse>,
        assignments = assingmentsQuery.rows;

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssignments(
    departmentId: string,
  ): Promise<AssetAssignmentsResponse[]> {
    try {
      const sqlString: string =
          "SELECT aa.*,u.username FROM asset_assignments aa JOIN users u ON aa.user_id=u.id WHERE aa.department_id=$1",
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentAssignmentsQuery =
          sqlQuery as QueryResult<AssetAssignmentsResponse>,
        departmentAssignments = departmentAssignmentsQuery.rows;

      return departmentAssignments;
    } catch (error) {
      throw error;
    }
  }
}
