export type RegistrationAuth = {
  username: string;
  email: string;
  password: string;
};
export type LoginAuth =
  | Pick<RegistrationAuth, "password">
  | Partial<RegistrationAuth>;

export interface AuthRepository {}
