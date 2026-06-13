import type { QueryResult } from "pg";
import type { Database } from "../../../Config/Db.js";
import type {
  AssetAssignments,
  AssetAssignmentsRepository,
  updateAssignmentDTO,
} from "./asset_assignment.types.js";
import type { updateAssetDTO } from "../Definition/asset.types.js";

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
  ): Promise<AssetAssignments> {
    try {
      const sqlString: string =
          "UPDATE asset_assignments SET returned_at=$2 WHERE id=$1 RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          assignmentId,
          newAssignmentDetails.returned_at,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const patchedAssignmentQuery = sqlQuery as QueryResult<AssetAssignments>,
        patchedAssignment = patchedAssignmentQuery.rows[0];

      return patchedAssignment!;
    } catch (error) {
      throw error;
    }
  }

  async getAssignments(assetId: string): Promise<AssetAssignments[]> {
    try {
      const sqlString: string =
          "SELECT * FROM asset_assignments WHERE asset_id=$1",
        sqlQuery = await this.db.query(sqlString, [assetId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const assingmentsQuery = sqlQuery as QueryResult<AssetAssignments>,
        assignments = assingmentsQuery.rows;

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssignments(
    departmentId: string,
  ): Promise<AssetAssignments[]> {
    try {
      const sqlString: string =
          "SELECT * FROM asset_assignments WHERE department_id=$1",
        sqlQuery = await this.db.query(sqlString, [departmentId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const departmentAssignmentsQuery =
          sqlQuery as QueryResult<AssetAssignments>,
        departmentAssignments = departmentAssignmentsQuery.rows;

      return departmentAssignments;
    } catch (error) {
      throw error;
    }
  }
}
