export type AssetAssignments = {
  id: string;
  department_id: string;
  asset_id: string;
  user_id: string;
  assigned_at: string;
  returned_at: string;
};

export type AssetAssignmentsResponse = AssetAssignments & {
  username: string;
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
    userId: string,
  ) => Promise<AssetAssignments>;
  getAssignments: (assetId: string) => Promise<AssetAssignmentsResponse[]>;
  getDepartmentAssignments: (
    departmentId: string,
  ) => Promise<AssetAssignmentsResponse[]>;
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
    userId: string,
  ) => Promise<AssetAssignments>;
  getAssignments: (assetId: string) => Promise<AssetAssignmentsResponse[]>;
  getDepartmentAssignments: (
    departmentId: string,
  ) => Promise<AssetAssignmentsResponse[]>;
}
