import { hashPassword } from "../../Utilities/Hasher.js";
import type { UserRepo } from "./user.repository.js";
import type {
  createUserDTO,
  PublicUser,
  updateUserDTO,
  User,
  UserService,
} from "./user.types.js";

export class UserServ implements UserService {
  constructor(private repo: UserRepo) {}

  public createPublicUser(user: User): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async assignUserToDepartment(
    userId: string,
    departmentId: string,
  ): Promise<PublicUser> {
    try {
      if (!userId || !departmentId)
        throw new Error("user id and department id must be provided");

      const updatedUser = await this.repo.assignUserToDepartment(
        userId,
        departmentId,
      );

      return this.createPublicUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async switchDepartment(
    departmentId: string,
    userId: string,
  ): Promise<PublicUser> {
    try {
      if (!departmentId || !userId)
        throw new Error("Department id and user id must be provided");

      const switchUserDepartment = await this.repo.switchDepartment(
        departmentId,
        userId,
      );

      return this.createPublicUser(switchUserDepartment);
    } catch (error) {
      throw error;
    }
  }

  async editUser(
    user_id: string,
    user_details: updateUserDTO,
  ): Promise<PublicUser> {
    try {
      if (!user_id || !user_details)
        throw new Error("User id and new user details must be provided");

      const allowedFields: string[] = ["username", "email", "password"];
      let filteredUserDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(user_details)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an invalid value`);

        if (key == "password") filteredUserDetails[key] = hashPassword(value);
        else filteredUserDetails[key] = value;
      }

      if (Object.keys(filteredUserDetails).length <= 0)
        throw new Error("Nothing to update");

      const patchedUser = await this.repo.editUser(
        user_id,
        filteredUserDetails as createUserDTO,
      );

      return this.createPublicUser(patchedUser);
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<PublicUser> {
    if (!email) throw new Error("Email is not provided");

    const user = await this.repo.getUserByEmail(email);

    return user;
  }

  async getUser(user_id: string): Promise<PublicUser> {
    try {
      if (!user_id) throw new Error("User id must be provided");

      const user = await this.repo.getUser(user_id);

      return this.createPublicUser(user);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(user_id: string): Promise<void> {
    try {
      if (!user_id) throw new Error("user id must be provided");

      await this.repo.deleteUser(user_id);
    } catch (error) {
      throw error;
    }
  }
}
