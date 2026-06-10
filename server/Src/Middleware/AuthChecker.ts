import type { IncomingMessage } from "http";
import { Warning } from "../Utilities/Logger.js";
import { decode_access_token } from "../Utilities/Jwt.js";
import type { PublicUser } from "../Modules/Users/user.types.js";

export type AuthInfo = {
  userId: string;
  departmentId: string;
};

export const AuthValidator = (request: IncomingMessage): AuthInfo => {
  const { authorization } = request.headers;

  if (!authorization) throw new Error("Auth token not provided");

  try {
    const userAuthToken = authorization.split(" ")[1];

    if (!userAuthToken) throw new Error("Invalid auth token");

    const userDetails = decode_access_token(userAuthToken);

    return {
      userId: (userDetails as PublicUser).id,
      departmentId: (userDetails as PublicUser).department_id,
    };
  } catch (error) {
    Warning("Error at authenticating user");
    throw error;
  }
};
