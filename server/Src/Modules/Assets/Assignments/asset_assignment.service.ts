import { individualAssetServ } from "../../../Data Objects/DTO.js";
import type {
  AssetAssignments,
  AssetAssignmentsRepository,
  AssetAssignmentsService,
  updateAssignmentDTO,
} from "./asset_assignment.types.js";

export class AssetAssignmentServ implements AssetAssignmentsService {
  constructor(private repo: AssetAssignmentsRepository) {}

  async assignAsset(
    assetId: string,
    departmentId: string,
    userId: string,
  ): Promise<AssetAssignments> {
    try {
      if (!assetId || !departmentId || !userId)
        throw new Error("Asset, department and user id must be provided");

      const assetAssignment = await this.repo.assignAsset(
        assetId,
        departmentId,
        userId,
      );

      await individualAssetServ.editIndividualAsset(assetId, {
        assigned: "in use",
      });

      return assetAssignment;
    } catch (error) {
      throw error;
    }
  }
  async editAssignment(
    assignmentId: string,
    newAssignmentDetails: updateAssignmentDTO,
  ): Promise<AssetAssignments> {
    try {
      if (!assignmentId || !newAssignmentDetails)
        throw new Error(
          "Assignment id and assignment details must be provided",
        );

      if (!newAssignmentDetails.returned_at)
        throw new Error("Return date must be provided");

      const editedAssignment = await this.repo.editAssignment(
        assignmentId,
        newAssignmentDetails,
      );

      await individualAssetServ.editIndividualAsset(editedAssignment.asset_id, {
        assigned: "open",
      });

      return editedAssignment;
    } catch (error) {
      throw error;
    }
  }

  async getAssignments(assetId: string): Promise<AssetAssignments[]> {
    try {
      if (!assetId) throw new Error("Asset id not provided");

      const assetAssignments = await this.repo.getAssignments(assetId);

      return assetAssignments;
    } catch (error) {
      throw error;
    }
  }

  async getDepartmentAssignments(
    departmentId: string,
  ): Promise<AssetAssignments[]> {
    try {
      if (!departmentId) throw new Error("Department id must be provided");

      const departmentAssignments =
        await this.repo.getDepartmentAssignments(departmentId);

      return departmentAssignments;
    } catch (error) {
      throw error;
    }
  }
}
