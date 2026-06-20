import type { QueryResult } from "pg";
import type { Database } from "../../../Config/Db.js";
import type {
  Asset,
  AssetRepository,
  createAssetDTO,
  updateAssetDTO,
} from "./asset.types.js";
import { individualAssetServ } from "../../../Data Objects/DTO.js";

export class AssetRepo implements AssetRepository {
  constructor(private db: Database) {}

  async createAsset(
    department_id: string,
    assetDetails: createAssetDTO,
  ): Promise<Asset> {
    try {
      const sqlString: string =
          "INSERT INTO asset(name,description,image,quantity,department_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
        sqlQuery = await this.db.query(sqlString, [
          assetDetails.name,
          assetDetails.description,
          assetDetails.image ?? "",
          assetDetails.quantity,
          department_id,
        ]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const insertion = sqlQuery as QueryResult<Asset>,
        newAsset = insertion.rows[0];

      for (let i = 0; i < assetDetails.quantity; i++)
        await individualAssetServ.createIndividualAsset(
          department_id,
          newAsset!.id,
        );

      return newAsset!;
    } catch (error) {
      throw error;
    }
  }

  async editAsset(
    assetsId: string,
    newAssetDetails: updateAssetDTO,
  ): Promise<Asset> {
    try {
      const date = new Date();

      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (const key in newAssetDetails) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(newAssetDetails[key as keyof createAssetDTO]);
      }

      keys.push(`last_updated=$${paramIndex++}`);
      values.push(date.toUTCString());

      const sqlString: string = `UPDATE asset SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [assetsId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const edition = sqlQuery as QueryResult<Asset>,
        edit = edition.rows[0];

      return edit!;
    } catch (error) {
      throw error;
    }
  }

  async getAllAssets(): Promise<Asset[]> {
    try {
      const sqlString: string = "SELECT * FROM asset",
        sqlQuery = await this.db.query(sqlString, []);

      if (!sqlQuery) throw new Error("SQL Query error");

      const allAssetsQuery = sqlQuery as QueryResult<Asset>,
        allAssets = allAssetsQuery.rows;

      return allAssets;
    } catch (error) {
      throw error;
    }
  }

  async getAsset(assetsId: string): Promise<Asset> {
    try {
      const sqlString: string = "SELECT * FROM asset WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [assetsId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieval = sqlQuery as QueryResult<Asset>,
        retrieved = retrieval.rows[0];

      return retrieved!;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssets(department_id: string): Promise<Asset[]> {
    try {
      const sqlString: string = "SELECT * FROM asset WHERE department_id=$1",
        sqlQuery = await this.db.query(sqlString, [department_id]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const retrieval = sqlQuery as QueryResult<Asset>,
        retrievedDepartmentAssets = retrieval.rows;

      return retrievedDepartmentAssets;
    } catch (error) {
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    try {
      const sqlString: string = "DELETE FROM asset WHERE id=$1";

      await this.db.query(sqlString, [assetId]);
    } catch (error) {
      throw error;
    }
  }
}
