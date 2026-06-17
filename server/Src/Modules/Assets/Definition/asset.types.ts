export type Asset = {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  department_id: string;
  created_at: string;
  last_updated: string;
};

export type createAssetDTO = Omit<
  Asset,
  "id" | "created_at" | "last_updated" | "department_id"
>;
export type updateAssetDTO = Partial<Omit<createAssetDTO, "department_id">>;

export interface AssetRepository {
  createAsset: (
    department_id: string,
    assetDetails: createAssetDTO,
  ) => Promise<Asset>;
  editAsset: (
    assetsId: string,
    newAssetDetails: updateAssetDTO,
  ) => Promise<Asset>;
  getAsset: (assetId: string) => Promise<Asset>;
  getAllAssets: () => Promise<Asset[]>;
  getDepartmentAssets: (department_id: string) => Promise<Asset[]>;
  deleteAsset: (assetId: string) => Promise<void>;
}

export interface AssetService {
  createAsset: (
    department_id: string,
    assetsDetails: createAssetDTO,
  ) => Promise<Asset>;
  editAsset: (
    assetId: string,
    newAssetDetails: updateAssetDTO,
  ) => Promise<Asset>;
  getAsset: (assetId: string) => Promise<Asset>;
  getDepartmentAssets: (department_id: string) => Promise<Asset[]>;
  getAllAssets: () => Promise<Asset[]>;
  deleteAsset: (assetId: string) => Promise<void>;
}
