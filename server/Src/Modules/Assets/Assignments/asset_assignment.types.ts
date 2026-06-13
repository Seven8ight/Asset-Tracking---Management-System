export type AssetAssignments = {
  id: string;
  department_id: string;
  asset_id: string;
  user_id: string;
  assigned_at: string;
  returned_at: string;
};

export type createAssignmentDTO = Omit<AssetAssignments, "id" | "returned_at">;
export type updateAssignmentDTO = Pick<AssetAssignments, "returned_at">;

export interface AssetAssignmentsRepository {
  assignAsset: (
    assetId: string,
    departmentId: string,
    userId: string,
  ) => Promise<AssetAssignments>;
  editAssignment: (
    assignmentId: string,
    newAssignmentDetails: updateAssignmentDTO,
  ) => Promise<AssetAssignments>;
  getAssignments: (assetId: string) => Promise<AssetAssignments[]>;
  getDepartmentAssignments: (
    departmentId: string,
  ) => Promise<AssetAssignments[]>;
}

export interface AssetAssignmentsService {
  assignAsset: (
    assetId: string,
    departmentId: string,
    userId: string,
  ) => Promise<AssetAssignments>;
  editAssignment: (
    assignmentId: string,
    newAssignmentDetails: updateAssignmentDTO,
  ) => Promise<AssetAssignments>;
  getAssignments: (assetId: string) => Promise<AssetAssignments[]>;
  getDepartmentAssignments: (
    departmentId: string,
  ) => Promise<AssetAssignments[]>;
}
