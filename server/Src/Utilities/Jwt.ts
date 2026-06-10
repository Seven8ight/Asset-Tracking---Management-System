import jwt from "jsonwebtoken";
import { JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } from "../Config/Env.js";

export type tokens = {
  accessToken: string;
  refreshToken: string;
};
export type RefreshAToken = {
  accessToken: string;
};

export const encode_access_token = (details: any): tokens => {
    const accessToken = jwt.sign(details, JWT_ACCESS_TOKEN as string, {
        expiresIn: "2 weeks",
      }),
      refreshToken = jwt.sign(details, JWT_REFRESH_TOKEN as string);

    return { accessToken, refreshToken };
  },
  decode_access_token = (access_token: string) => {
    try {
      return jwt.verify(access_token, JWT_ACCESS_TOKEN as string);
    } catch (error) {
      process.stdout.write(`${(error as Error).message}`);
      throw error;
    }
  },
  decode_refresh_token = (refresh_token: string) => {
    try {
      return jwt.verify(refresh_token, JWT_REFRESH_TOKEN as string);
    } catch (error) {
      process.stdout.write(`${(error as Error).message}`);
      throw error;
    }
  },
  refresh_access_token = (refresh_token: any): RefreshAToken => {
    try {
      const details = decode_refresh_token(refresh_token),
        newAccessToken = jwt.sign(details, JWT_ACCESS_TOKEN!, {
          expiresIn: "2 weeks",
        });

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw error;
    }
  };
