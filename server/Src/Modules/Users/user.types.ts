export type User = {
  id: string;
  department_id: string;
  username: string;
  phone: string;
  email: string;
  password: string;
  last_login_at: string;
  created_at: string;
  deleted_at: string;
};

export type createUserDTO = Pick<
  User,
  "department_id" | "username" | "phone" | "email" | "password"
>;

export type updateUserDTO =
  | Partial<User>
  | Omit<
      User,
      "id" | "department_id" | "last_login_at" | "created_at" | "deleted_at"
    >;

export type PublicUser = Omit<User, "password">;

export interface UserRepository {
  assignUserToDepartment: (
    userId: string,
    departmentId: string,
  ) => Promise<User>;
  editUser: (userId: string, newDetails: updateUserDTO) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}
export interface UserService {
  assignUserToDepartment: (
    userId: string,
    departmentId: string,
  ) => Promise<PublicUser>;
  editUser: (userId: string, userDetails: createUserDTO) => Promise<PublicUser>;
  getUser: (userId: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<void>;
}
