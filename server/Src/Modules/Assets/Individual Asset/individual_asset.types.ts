export type AssetStatus = "open" | "in use" | "repaired";

export type IndividualAsset = {
  id: string;
  asset_id: string;
  assigned: string;
  is_repaired: string;
  is_broken: string;
  department_id: string;
};

export type createIndividualAssetDTO = Omit<IndividualAsset, "id">;
export type updateIndividualAssetDTO = Partial<
  Omit<IndividualAsset, "id" | "asset_id" | "department_id">
>;

export interface AssetRepository {
  createIndividualAsset: (
    departmentId: string,
    assetId: string,
  ) => Promise<IndividualAsset>;
  editIndividualAsset: (
    assetId: string,
    newAssetDetails: updateIndividualAssetDTO,
  ) => Promise<IndividualAsset>;
  getIndividualAsset: (individualId: string) => Promise<IndividualAsset>;
  getIndividualAssets: (assetId: string) => Promise<IndividualAsset[]>;
  deleteIndividualAsset: (assetId: string) => Promise<void>;
  deleteIndividualAssets: (assetId: string) => Promise<void>;
}

export interface AssetService {
  createIndividualAsset: (
    departmentId: string,
    assetsId: string,
  ) => Promise<IndividualAsset>;
  editIndividualAsset: (
    assetId: string,
    newAssetDetails: updateIndividualAssetDTO,
  ) => Promise<IndividualAsset>;
  getIndividualAsset: (individualId: string) => Promise<IndividualAsset>;
  getIndividualAssets: (assetsId: string) => Promise<IndividualAsset[]>;
  deleteIndividualAsset: (assetId: string) => Promise<void>;
  deleteIndividualAssets: (assetId: string) => Promise<void>;
}
