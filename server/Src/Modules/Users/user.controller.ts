import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getRequestBody,
  sendResponseMessage,
} from "../../Utilities/HttpFunctions.js";
import { userServ } from "../../Data Objects/DTO.js";
import { AuthValidator } from "../../Middleware/AuthChecker.js";
import { PermissionChecker } from "../../Middleware/PermissionChecker.js";

export const UserController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const service = userServ;

  try {
    switch (request.method) {
      case "GET": {
        await PermissionChecker(request, "users", "Manage user roles");

        const userGetDetails = AuthValidator(request);

        const user = service.getUser(userGetDetails.userId);
        sendResponseMessage(200, false, user, response);

        break;
      }
      case "PATCH":
        await PermissionChecker(request, "users", "Manage user roles");

        const userPatchDetails = AuthValidator(request);

        const patchUserDetails: any = await getRequestBody(request),
          patchedUser = await service.editUser(
            userPatchDetails.userId,
            patchUserDetails,
          );

        sendResponseMessage(201, false, patchedUser, response);

        break;
      case "DELETE":
        await PermissionChecker(request, "users", "Manage user roles");

        const userDeletionDetails = AuthValidator(request);

        await service.deleteUser(
          userDeletionDetails.departmentId,
          userDeletionDetails.userId,
        );

        sendResponseMessage(
          204,
          false,
          "User softly deleted successfully",
          response,
        );
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
