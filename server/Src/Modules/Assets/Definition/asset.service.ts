import type {
  Asset,
  AssetRepository,
  AssetService,
  createAssetDTO,
  updateAssetDTO,
} from "./asset.types.js";

export class AssetsServ implements AssetService {
  constructor(private repo: AssetRepository) {}

  async createAsset(
    department_id: string,
    assetsDetails: createAssetDTO,
  ): Promise<Asset> {
    if (!department_id || !assetsDetails)
      throw new Error("Department id and asset details must be provided");

    const allowedFields: (keyof createAssetDTO)[] = [
      "description",
      "name",
      "quantity",
    ];

    let filteredKeyValues: Record<string, any> = {};

    for (const key of allowedFields) {
      const value = assetsDetails[key as keyof createAssetDTO];

      if (
        value == undefined ||
        value == null ||
        (typeof value === "string" && value.trim() === "")
      )
        throw new Error(`${key} has an invalid value`);

      filteredKeyValues[key] = value;
    }

    if (assetsDetails.image)
      filteredKeyValues["image"] = assetsDetails["image"];

    const newAsset = await this.repo.createAsset(
      department_id,
      filteredKeyValues as createAssetDTO,
    );

    return newAsset;
  }

  async editAsset(
    assetsId: string,
    newAssetDetails: updateAssetDTO,
  ): Promise<Asset> {
    try {
      if (!assetsId || !newAssetDetails)
        throw new Error("Department id and asset details must be provided");

      const allowedFields: (keyof createAssetDTO)[] = [
        "description",
        "image",
        "name",
        "quantity",
      ];

      let filteredKeyValues: Record<string, any> = {};

      for (const key of allowedFields) {
        const value = newAssetDetails[key as keyof createAssetDTO];

        if (value == undefined || value == null)
          throw new Error(`${key} has an invalid value`);

        filteredKeyValues[key] = value;
      }

      const patchAsset = this.repo.editAsset(
        assetsId,
        filteredKeyValues as updateAssetDTO,
      );

      return patchAsset;
    } catch (error) {
      throw error;
    }
  }

  async getAsset(assetsId: string): Promise<Asset> {
    try {
      if (!assetsId) throw new Error("Assets id must be provided");

      const assets = await this.repo.getAsset(assetsId);

      return assets;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssets(department_id: string): Promise<Asset[]> {
    try {
      if (!department_id) throw new Error("Department id must be provided");

      const departmentAssets =
        await this.repo.getDepartmentAssets(department_id);

      return departmentAssets;
    } catch (error) {
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    try {
      if (!assetId) throw new Error("asseets id must be provided");

      await this.repo.deleteAsset(assetId);
    } catch (error) {
      throw error;
    }
  }
}
