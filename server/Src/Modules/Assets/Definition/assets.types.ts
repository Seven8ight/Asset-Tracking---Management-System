export type Assets = {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  department_id: string;
  created_at: string;
  last_updated: string;
};

export type createAssetsDTO = Omit<
  Assets,
  "id" | "created_at" | "last_updated" | "department_id"
>;
export type updateAssetsDTO = Partial<Omit<createAssetsDTO, "department_id">>;

export interface AssetsRepository {
  createAssets: (
    department_id: string,
    assetsDetails: createAssetsDTO,
  ) => Promise<Assets>;
  editAssets: (
    assetsId: string,
    newAssetDetails: updateAssetsDTO,
  ) => Promise<Assets>;
  getAssets: (assetsId: string) => Promise<Assets>;
  getDepartmentAssets: (department_id: string) => Promise<Assets[]>;
  deleteAssets: (assetId: string) => Promise<void>;
}

export interface AssetsService {
  createAssets: (
    department_id: string,
    assetsDetails: createAssetsDTO,
  ) => Promise<Assets>;
  editAssets: (
    assetsId: string,
    newAssetDetails: updateAssetsDTO,
  ) => Promise<Assets>;
  getAssets: (assetsId: string) => Promise<Assets>;
  getDepartmentAssets: (department_id: string) => Promise<Assets[]>;
  deleteAssets: (assetId: string) => Promise<void>;
}
