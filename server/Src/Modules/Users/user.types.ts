export type User = {
  id: string;
  department_id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  last_login_at: string;
  created_at: string;
  deleted_at: string;
};

export type createUserDTO = Pick<
  User,
  "department_id" | "name" | "phone" | "email" | "password"
>;

export type updateUserDTO =
  | Partial<User>
  | Omit<
      User,
      "id" | "department_id" | "last_login_at" | "created_at" | "deleted_at"
    >;

export type PublicUser = Omit<User, "password">;

export interface UserRepository {
  editUser: (
    department_id: string,
    userId: string,
    newDetails: updateUserDTO,
  ) => Promise<User>;
  getUser: (department_id: string, userId: string) => Promise<User>;
  deleteUser: (department_id: string, userId: string) => Promise<void>;
}
export interface UserService {
  editUser: (
    department_id: string,
    userId: string,
    userDetails: createUserDTO,
  ) => Promise<PublicUser>;
  getUser: (department_id: string, userId: string) => Promise<PublicUser>;
  deleteUser: (department_id: string, userId: string) => Promise<void>;
}
