import {
  encode_access_token,
  refresh_access_token,
  type RefreshAToken,
  type tokens,
} from "../../Utilities/Jwt.js";
import type { PublicUser, User } from "../Users/user.types.js";
import type {
  AuthRepository,
  AuthService,
  LoginAuth,
  RegistrationAuth,
} from "./authentication.types.js";

export class AuthenticationService implements AuthService {
  constructor(private repo: AuthRepository) {}

  public createPublicUser(user: User): PublicUser {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async register(userDetails: RegistrationAuth): Promise<tokens> {
    try {
      const allowedFields: (keyof RegistrationAuth)[] = [
        "email",
        "password",
        "username",
      ];

      for (const key of allowedFields) {
        let value = userDetails[key];

        if (value === undefined || value === null)
          throw new Error(`${key} has an invalid value`);
      }

      const newUser = await this.repo.register(userDetails),
        publicUser = this.createPublicUser(newUser),
        encryptedUser = encode_access_token(publicUser);

      return encryptedUser;
    } catch (error) {
      throw error;
    }
  }

  async login(userDetails: LoginAuth): Promise<tokens> {
    try {
      const allowedFields: (keyof LoginAuth)[] = [
        "email",
        "password",
        "username",
      ];

      let filteredKeyValues: Record<string, any> = {};
      for (const key of allowedFields) {
        let value = userDetails[key];

        if (value === undefined || value === null) continue;

        filteredKeyValues[key] = value;
      }

      if (!filteredKeyValues.email && !filteredKeyValues.username)
        throw new Error("Email or username must be provided");

      if (!filteredKeyValues.password)
        throw new Error("Password must be provided");

      const loginUser = await this.repo.login(filteredKeyValues as LoginAuth),
        publicUser = this.createPublicUser(loginUser),
        encryptedUser = encode_access_token(publicUser);

      return encryptedUser;
    } catch (error) {
      throw error;
    }
  }

  async refreshAuthToken(refreshToken: string): Promise<RefreshAToken> {
    try {
      const newAToken = refresh_access_token(refreshToken);

      return newAToken;
    } catch (error) {
      throw error;
    }
  }
}
