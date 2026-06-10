import type { IncomingMessage, ServerResponse } from "http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import { rolesService } from "../../../Data Objects/DTO.js";

export const RoleController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): Promise<void> => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  const service = rolesService;

  try {
    AuthValidator(request);

    switch (request.method) {
      case "GET":
        let responseBody: any;

        if (!pathNames[2]) responseBody = await service.getRoles();
        else {
          const pathname = PathnameValidator(pathNames);

          if (pathname == "permissions") {
            if (!pathNames[3])
              return sendResponseMessage(
                400,
                true,
                "Invalid role id provided",
                response,
              );

            const roleId = pathNames[3];
            responseBody = await service.getRoleWithPermissions(roleId);
          }
        }

        sendResponseMessage(200, false, responseBody, response);
        break;
      case "POST":
        const postRoleBody: any = await getRequestBody(request),
          createRole = await service.createRole(postRoleBody);

        sendResponseMessage(201, false, createRole, response);
        break;
      case "PATCH":
        const patchRoleBody: any = await getRequestBody(request),
          updateRole = await service.editRole(patchRoleBody.id, patchRoleBody);

        sendResponseMessage(200, false, updateRole, response);
        break;
      case "DELETE":
        const deleteRoleBody: any = await getRequestBody(request);
        await service.deleteRole(deleteRoleBody.id);

        sendResponseMessage(204, false, "Deletion successfully", response);
        break;
      default:
        sendResponseMessage(404, false, "Invalid HTTP method", response);
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
