import type {
  Assets,
  AssetsRepository,
  AssetsService,
  createAssetsDTO,
  updateAssetsDTO,
} from "./assets.types.js";

export class AssetsServ implements AssetsService {
  constructor(private repo: AssetsRepository) {}

  async createAssets(
    department_id: string,
    assetsDetails: createAssetsDTO,
  ): Promise<Assets> {
    try {
      if (!department_id || !assetsDetails)
        throw new Error("Department id and asset details must be provided");

      const allowedFields: (keyof createAssetsDTO)[] = [
        "description",
        "image",
        "name",
        "quantity",
      ];

      let filteredKeyValues: Record<string, any> = {};

      for (const key of allowedFields) {
        const value = assetsDetails[key as keyof createAssetsDTO];

        if (value == undefined || value == null)
          throw new Error(`${key} has an invalid value`);

        filteredKeyValues[key] = value;
      }

      const newAsset = this.repo.createAssets(
        department_id,
        filteredKeyValues as createAssetsDTO,
      );

      return newAsset;
    } catch (error) {
      throw error;
    }
  }

  async editAssets(
    assetsId: string,
    newAssetDetails: updateAssetsDTO,
  ): Promise<Assets> {
    try {
      if (!assetsId || !newAssetDetails)
        throw new Error("Department id and asset details must be provided");

      const allowedFields: (keyof createAssetsDTO)[] = [
        "description",
        "image",
        "name",
        "quantity",
      ];

      let filteredKeyValues: Record<string, any> = {};

      for (const key of allowedFields) {
        const value = newAssetDetails[key as keyof createAssetsDTO];

        if (value == undefined || value == null)
          throw new Error(`${key} has an invalid value`);

        filteredKeyValues[key] = value;
      }

      const patchAsset = this.repo.editAssets(
        assetsId,
        filteredKeyValues as updateAssetsDTO,
      );

      return patchAsset;
    } catch (error) {
      throw error;
    }
  }

  async getAssets(assetsId: string): Promise<Assets> {
    try {
      if (!assetsId) throw new Error("Assets id must be provided");

      const assets = await this.repo.getAssets(assetsId);

      return assets;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssets(department_id: string): Promise<Assets[]> {
    try {
      if (!department_id) throw new Error("Department id must be provided");

      const departmentAssets =
        await this.repo.getDepartmentAssets(department_id);

      return departmentAssets;
    } catch (error) {
      throw error;
    }
  }

  async deleteAssets(assetId: string): Promise<void> {
    try {
      if (!assetId) throw new Error("asseets id must be provided");

      await this.repo.deleteAssets(assetId);
    } catch (error) {
      throw error;
    }
  }
}
