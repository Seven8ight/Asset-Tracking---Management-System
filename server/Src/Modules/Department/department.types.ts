export type Department = {
  id: string;
  name: string;
  description: string;
  color: string;
  manager_id: string;
  created_at: string;
};
export type FullDepartmentDetails = {
  id: string;
  name: string;
  description: string;
  color: string;
  manager_id: string;
  created_at: string;
  manager_name: string;
};

export type departmentmember = {
  name: string;
  email: string;
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
  getDepartment: (departmentId: string) => Promise<FullDepartmentDetails>;
  getUsersInDepartments: (departmentId: string) => Promise<departmentmember[]>;
  getAllDepartments: () => Promise<FullDepartmentDetails[]>;
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
  getDepartment: (departmentId: string) => Promise<FullDepartmentDetails>;
  getUsersInDepartments: (departmentId: string) => Promise<departmentmember[]>;
  getAllDepartments: () => Promise<FullDepartmentDetails[]>;
  deleteDepartment: (departmentId: string) => Promise<void>;
}
