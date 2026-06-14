import type {
  IndividualAsset,
  AssetRepository,
  AssetService,
  updateIndividualAssetDTO,
} from "./individual_asset.types.js";

export class IndividualAssetServ implements AssetService {
  constructor(private repo: AssetRepository) {}

  async createIndividualAsset(
    departmentId: string,
    assetsId: string,
  ): Promise<IndividualAsset> {
    try {
      if (!departmentId || !assetsId)
        throw new Error("Department id and assets id must be provided");

      const creationAsset = await this.repo.createIndividualAsset(
        departmentId,
        assetsId,
      );

      return creationAsset;
    } catch (error) {
      throw error;
    }
  }

  async editIndividualAsset(
    assetId: string,
    newAssetDetails: updateIndividualAssetDTO,
  ): Promise<IndividualAsset> {
    try {
      if (!assetId || !newAssetDetails)
        throw new Error("Asset id and asset details must be provided");

      const allowedFields: (keyof updateIndividualAssetDTO)[] = [
        "assigned",
        "is_broken",
        "is_repaired",
      ];
      let filteredAssetDetails: Record<string, any> = {};

      for (let key of allowedFields) {
        const value = newAssetDetails[key];

        if (value == undefined || value == null) continue;

        filteredAssetDetails[key] = value;
      }

      if (Object.keys(filteredAssetDetails).length <= 0)
        throw new Error(
          `No fields provided for updating the asset, ${assetId}`,
        );

      const patchedAsset = await this.editIndividualAsset(
        assetId,
        filteredAssetDetails,
      );
      return patchedAsset;
    } catch (error) {
      throw error;
    }
  }

  async getIndividualAssets(assetsId: string): Promise<IndividualAsset[]> {
    try {
      if (!assetsId) throw new Error("Main Assets id not provided");

      const assets = await this.repo.getIndividualAssets(assetsId);

      return assets;
    } catch (error) {
      throw error;
    }
  }

  async deleteIndividualAssets(assetId: string): Promise<void> {
    try {
      if (!assetId) throw new Error("Assets id must be provided");

      await this.repo.deleteIndividualAssets(assetId);
    } catch (error) {
      throw error;
    }
  }
}
