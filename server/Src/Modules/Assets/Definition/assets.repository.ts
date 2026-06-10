import type { QueryResult } from "pg";
import type { Database } from "../../../Config/Db.js";
import type {
  Assets,
  AssetsRepository,
  createAssetsDTO,
  updateAssetsDTO,
} from "./assets.types.js";

export class AssetsRepo implements AssetsRepository {
  constructor(private db: Database) {}

  async createAssets(
    department_id: string,
    assetDetails: createAssetsDTO,
  ): Promise<Assets> {
    try {
      const sqlString: string =
          "INSERT INTO assets(name,description,image,quantity,department_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          assetDetails.name,
          assetDetails.description,
          assetDetails.image ?? "",
          assetDetails.quantity,
          department_id,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const insertion = sqlQuery as QueryResult<Assets>,
        newAssets = insertion.rows[0];

      return newAssets!;
    } catch (error) {
      throw error;
    }
  }

  async editAssets(
    assetsId: string,
    newAssetDetails: updateAssetsDTO,
  ): Promise<Assets> {
    try {
      const date = new Date();

      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (const key in newAssetDetails) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(newAssetDetails[key as keyof createAssetsDTO]);
      }

      keys.push(`last_updated=$${paramIndex++}`);
      values.push(date.toUTCString());

      const sqlString: string = `UPDATE assets SET ${keys.join(",")} WHERE id=$1 RETURING *`,
        sqlQuery = await this.db.query(sqlString, [assetsId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const edition = sqlQuery as QueryResult<Assets>,
        edit = edition.rows[0];

      return edit!;
    } catch (error) {
      throw error;
    }
  }

  async getAssets(assetsId: string): Promise<Assets> {
    try {
      const sqlString: string = "SELECT * FROM assets WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [assetsId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieval = sqlQuery as QueryResult<Assets>,
        retrieved = retrieval.rows[0];

      return retrieved!;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssets(department_id: string): Promise<Assets[]> {
    try {
      const sqlString: string = "SELECT * FROM assets WHERE department_id=$1",
        sqlQuery = await this.db.query(sqlString, [department_id]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieval = sqlQuery as QueryResult<Assets>,
        retrievedDepartmentAssets = retrieval.rows;

      return retrievedDepartmentAssets;
    } catch (error) {
      throw error;
    }
  }

  async deleteAssets(assetId: string): Promise<void> {
    try {
      const sqlString: string = "DELETE FROM assets WHERE id=$1";

      await this.db.query(sqlString, [assetId]);
    } catch (error) {
      throw error;
    }
  }
}
