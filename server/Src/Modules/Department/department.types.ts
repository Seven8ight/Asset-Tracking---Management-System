export type Department = {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
};

export type createDepartmentDTO = Omit<Department, "id" | "created_at">;
export type updateDepartmentDTO = Partial<createDepartmentDTO>;

export interface DepartmentRepository {
  createDepartment: (
    departmentDetails: createDepartmentDTO,
  ) => Promise<Department>;
  editDepartment: (
    departmentId: string,
    newDepartmentDetails: updateDepartmentDTO,
  ) => Promise<Department>;
  getDepartment: (departmentId: string) => Promise<Department>;
  getAllDepartments: () => Promise<Department[]>;
  deleteDepartment: (departmentId: string) => Promise<void>;
}

export interface DepartmentService {
  createDepartment: (
    departmentDetails: createDepartmentDTO,
  ) => Promise<Department>;
  editDepartment: (
    departmentId: string,
    newDepartmentDetails: updateDepartmentDTO,
  ) => Promise<Department>;
  getDepartment: (departmentId: string) => Promise<Department>;
  getAllDepartments: () => Promise<Department[]>;
  deleteDepartment: (departmentId: string) => Promise<void>;
}
