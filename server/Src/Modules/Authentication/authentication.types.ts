import type { RefreshAToken, tokens } from "../../Utilities/Jwt.js";
import type { User } from "../Users/user.types.js";

export type RegistrationAuth = {
  username: string;
  email: string;
  password: string;
};
export type LoginAuth = Pick<RegistrationAuth, "password"> &
  Partial<RegistrationAuth>;

export interface AuthRepository {
  register: (userDetails: RegistrationAuth) => Promise<User>;
  login: (userDetails: LoginAuth) => Promise<User>;
}

export interface AuthService {
  register: (userDetails: RegistrationAuth) => Promise<tokens>;
  login: (userDetails: LoginAuth) => Promise<tokens>;
  refreshAuthToken: (refreshToken: string) => Promise<RefreshAToken>;
}
