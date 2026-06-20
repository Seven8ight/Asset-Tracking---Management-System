import type { QueryResult } from "pg";
import type { Database } from "../../../Config/Db.js";
import type {
  IndividualAsset,
  AssetRepository,
  updateIndividualAssetDTO,
} from "./individual_asset.types.js";

export class IndividualAssetRepo implements AssetRepository {
  constructor(private db: Database) {}

  async createIndividualAsset(
    departmentId: string,
    assetsId: string,
  ): Promise<IndividualAsset> {
    try {
      const sqlString: string = `INSERT INTO individual_asset(department_id,asset_id) VALUES($1,$2) RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [departmentId, assetsId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const assetQuery = sqlQuery as QueryResult<IndividualAsset>,
        asset = assetQuery.rows[0];

      return asset!;
    } catch (error) {
      throw error;
    }
  }

  async editIndividualAsset(
    assetId: string,
    newAssetDetails: updateIndividualAssetDTO,
  ): Promise<IndividualAsset> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (let key in newAssetDetails) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(newAssetDetails[key as keyof updateIndividualAssetDTO]);
      }

      const sqlString: string = `UPDATE individual_asset SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        sqlQuery = await this.db.query(sqlString, [assetId, ...values]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const editQuery = sqlQuery as QueryResult<IndividualAsset>,
        patchedAsset = editQuery.rows[0];

      return patchedAsset!;
    } catch (error) {
      throw error;
    }
  }

  async getIndividualAsset(individualId: string): Promise<IndividualAsset> {
    try {
      const sqlString = "SELECT * FROM individual_asset WHERE id=$1",
        sqlQuery = await this.db.query(sqlString, [individualId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const individualAssetQuery = sqlQuery as QueryResult<IndividualAsset>,
        individualAsset = individualAssetQuery.rows[0];

      return individualAsset!;
    } catch (error) {
      throw error;
    }
  }

  async getIndividualAssets(assetsId: string): Promise<IndividualAsset[]> {
    try {
      const sqlString: string =
          "SELECT * FROM individual_asset WHERE asset_id=$1",
        sqlQuery = await this.db.query(sqlString, [assetsId]);

      if (!sqlQuery) throw new Error("SQL Query error");

      const editQuery = sqlQuery as QueryResult<IndividualAsset>,
        assets = editQuery.rows;

      return assets;
    } catch (error) {
      throw error;
    }
  }

  async deleteIndividualAsset(assetId: string) {
    try {
      const sqlString = `DELETE FROM individual_assets
          WHERE id = (
              SELECT id 
              FROM individual_assets
              WHERE is_broken IS NOT 'TRUE' OR is_repaired IS NOT 'TRUE'
              ORDER BY RANDOM()         
              LIMIT 1                   
          ) and asset_id=$1;`,
        sqlQuery = await this.db.query(sqlString, [assetId]);

      if (!sqlQuery) throw new Error("SQL Query error");
    } catch (error) {
      throw error;
    }
  }

  async deleteIndividualAssets(assetId: string): Promise<void> {
    try {
      const sqlString = "DELETE FROM individual_asset WHERE asset_id=$1",
        sqlQuery = await this.db.query(sqlString, [assetId]);

      if (!sqlQuery) throw new Error("SQL Query error");
    } catch (error) {
      throw error;
    }
  }
}
