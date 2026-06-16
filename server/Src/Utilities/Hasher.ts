import { compareSync, hashSync } from "bcryptjs";

export const hashPassword = (password: string): string =>
    hashSync(password, 10),
  comparePassword = (password: string, hashedPassword: string): boolean =>
    compareSync(password, hashedPassword),
  hashValue = (value: any): string => hashSync(value, 10),
  compareValue = (value: any, hashedValue: string) =>
    compareSync(value, hashedValue);
