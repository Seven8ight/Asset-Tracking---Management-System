import { logsServ } from "../../Data Objects/DTO.js";
import type {
  createDepartmentDTO,
  Department,
  DepartmentRepository,
  DepartmentService,
  updateDepartmentDTO,
} from "./department.types.js";

export class DepartmentServ implements DepartmentService {
  constructor(private repo: DepartmentRepository) {}

  async createDepartment(
    departmentDetails: createDepartmentDTO,
  ): Promise<Department> {
    try {
      if (!departmentDetails) throw new Error("Department details missing");

      const allowedFields: (keyof createDepartmentDTO)[] = [
        "color",
        "description",
        "name",
      ];

      let filteredDepartmentDetails: Record<string, any> = {};

      for (const key of allowedFields) {
        const value = departmentDetails[key as keyof createDepartmentDTO];

        if (value == undefined || value == null)
          throw new Error(`${key} is invalid`);

        filteredDepartmentDetails[key] = value;
      }

      const newDepartment = await this.repo.createDepartment(
        filteredDepartmentDetails as createDepartmentDTO,
      );

      return newDepartment;
    } catch (error) {
      throw error;
    }
  }

  async editDepartment(
    departmentId: string,
    newDepartmentDetails: updateDepartmentDTO,
  ): Promise<Department> {
    try {
      if (!departmentId || !newDepartmentDetails)
        throw new Error(
          "Department id and new department details must be provided",
        );

      const allowedFields: (keyof createDepartmentDTO)[] = [
        "color",
        "description",
        "name",
      ];

      let filteredDepartmentDetails: Record<string, any> = {};

      for (const key of allowedFields) {
        const value = newDepartmentDetails[key as keyof updateDepartmentDTO];

        if (value == undefined || value == null) continue;

        filteredDepartmentDetails[key] = value;
      }

      const newDepartment = await this.repo.editDepartment(
        departmentId,
        filteredDepartmentDetails as updateDepartmentDTO,
      );

      return newDepartment;
    } catch (error) {
      throw error;
    }
  }

  async getDepartment(departmentId: string): Promise<Department> {
    try {
      if (!departmentId) throw new Error("Department id must be provided");

      const department = await this.repo.getDepartment(departmentId);

      return department;
    } catch (error) {
      throw error;
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    try {
      const departments = await this.repo.getAllDepartments();

      return departments;
    } catch (error) {
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      if (!departmentId) throw new Error("Department id must be provided");

      await this.repo.deleteDepartment(departmentId);
    } catch (error) {
      throw error;
    }
  }
}
