import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { userServ } from "../../Data Objects/DTO.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { PermissionChecker } from "../../Middleware/PermissionChecker.js";

export const UserController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = userServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        await PermissionChecker(request, "users", "Manage user roles");
        const specifiedUser = PathnameValidator(pathnames);

        const userRetrieved = await service.getUser(specifiedUser);
        sendResponseMessage(200, false, userRetrieved, response);

        break;
      case "PATCH":
        await PermissionChecker(request, "users", "Manage user roles");

        const patchUserDetails: any = await getRequestBody(request),
          patchedUser = await service.editUser(user.userId, patchUserDetails);

        sendResponseMessage(201, false, patchedUser, response);

        break;
      case "DELETE":
        const userDeletionDetails = AuthValidator(request);

        await service.deleteUser(userDeletionDetails.userId);

        sendResponseMessage(204, false, "User deleted successfully", response);
        break;
      default:
        sendResponseMessage(405, true, "Invalid http method", response);
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
