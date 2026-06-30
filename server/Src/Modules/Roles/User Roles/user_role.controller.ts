import { ServerResponse, type IncomingMessage } from "http";
import {
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import { logsServ, userRolesServ } from "../../../Data Objects/DTO.js";

export const UserRoleController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames = requestUrl.pathname.split("/").filter(Boolean);

  const service = userRolesServ;

  try {
    const user = AuthValidator(request);

    switch (request.method) {
      case "GET":
        let requestBody: any;

        if (!pathnames[2])
          requestBody = await service.getUserRoles(user.userId);
        else {
          const pathname = PathnameValidator(pathnames);
          if (pathname == "permissions")
            requestBody = await service.getUserRolesWithPermissions(
              user.userId,
            );
        }

        sendResponseMessage(200, false, requestBody, response);
        break;
      case "POST":
        const postRoleId = PathnameValidator(pathnames);

        const createUserRole = await service.createUserRole(
          user.userId,
          postRoleId,
        );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: postRoleId,
          entity_type: "Role assignment",
          action: "User being assigned a role",
          old_values: {},
          new_values: createUserRole,
        });

        sendResponseMessage(201, false, createUserRole, response);
        break;
      case "PATCH":
        const userToChangeId = PathnameValidator(pathnames),
          newRoleId = pathnames[3];

        if (!newRoleId)
          return sendResponseMessage(200, false, "Provide role id", response);

        const newUserRole = await service.changeUserRole(
          userToChangeId,
          newRoleId,
        );

        sendResponseMessage(200, false, newUserRole, response);
        break;
      case "DELETE":
        const deleteRoleId = PathnameValidator(pathnames),
          beforeRevockation = await service.getUserRoles(user.userId);

        await service.deleteUserRole(user.userId, deleteRoleId);

        const afterRevockation = await service.getUserRoles(user.userId);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: deleteRoleId,
          entity_type: "Role revockation",
          action: "User being revoked a role",
          old_values: beforeRevockation,
          new_values: afterRevockation,
        });

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
