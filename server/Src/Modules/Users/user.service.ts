import type { UserRepo } from "./user.repository.js";
import type {
  createUserDTO,
  PublicUser,
  User,
  UserService,
} from "./user.types.js";

export class UserServ implements UserService {
  constructor(private repo: UserRepo) {}

  public createPublicUser(user: User): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async editUser(
    user_id: string,
    user_details: createUserDTO,
  ): Promise<PublicUser> {
    try {
      if (!user_id || !user_details)
        throw new Error("User id and new user details must be provided");

      const allowedFields: string[] = [
        "department_id",
        "name",
        "phone",
        "email",
        "password",
      ];
      let filteredUserDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(user_details)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an invalid value`);

        filteredUserDetails[key] = value;
      }

      const patchedUser = await this.repo.editUser(
        user_id,
        filteredUserDetails as createUserDTO,
      );

      return this.createPublicUser(patchedUser);
    } catch (error) {
      throw error;
    }
  }

  async getUser(user_id: string): Promise<PublicUser> {
    try {
      if (user_id) throw new Error("User id and userdetails ");

      const user = await this.repo.getUser(user_id);

      return this.createPublicUser(user);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(department_id: string, user_id: string): Promise<void> {
    try {
      if (!department_id || !user_id)
        throw new Error("Department id and user id must be provided");

      await this.repo.deleteUser(department_id, user_id);
    } catch (error) {
      throw error;
    }
  }
}
