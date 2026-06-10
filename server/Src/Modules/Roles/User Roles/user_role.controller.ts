import type { IncomingMessage, ServerResponse } from "http";
import {
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import { userRolesServ } from "../../../Data Objects/DTO.js";

export const UserRoleController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const userRoleServ = userRolesServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        let requestBody: any;

        if (!pathnames[2])
          requestBody = await userRoleServ.getUserRoles(user.userId);
        else {
          const pathname = PathnameValidator(pathnames);
          if (pathname == "permissions")
            requestBody = await userRoleServ.getUserRolesWithPermissions(
              user.userId,
            );
        }

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postRoleId = PathnameValidator(pathnames);

        const createUserRole = await userRoleServ.createUserRole(
          user.userId,
          postRoleId,
        );

        sendResponseMessage(201, false, createUserRole, response);
        break;
      case "DELETE":
        const deleteRoleId = PathnameValidator(pathnames);

        await userRoleServ.deleteUserRole(user.userId, deleteRoleId);

        sendResponseMessage(204, false, "Deletion successful", response);
        break;
      default:
        sendResponseMessage(
          405,
          false,
          "Invalid HTTP method, try again",
          response,
        );
        break;
    }
  } catch (error) {
    switch ((error as Error).message) {
      case "Auth token not provided":
      case "Invalid auth token":
        sendResponseMessage(401, true, "Auth token not provided", response);
        break;
      default:
        if ((error as Error).message.includes("malformed"))
          sendResponseMessage(
            403,
            true,
            "Auth token expired, re-login",
            response,
          );
        else sendResponseMessage(400, true, (error as Error).message, response);
        break;
    }
  }
};
