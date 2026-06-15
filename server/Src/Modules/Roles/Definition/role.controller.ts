import type { IncomingMessage, ServerResponse } from "http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import { logsServ, rolesService } from "../../../Data Objects/DTO.js";

export const RoleController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
): Promise<void> => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean);

  const service = rolesService;

  try {
    const user = AuthValidator(request);

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
          createRole = await service.createRole(
            postRoleBody,
            user.departmentId,
          );

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: createRole.id,
          entity_type: "Role item",
          action: "Creating a role",
          old_values: {},
          new_values: createRole,
        });

        sendResponseMessage(201, false, createRole, response);
        break;
      case "PATCH":
        const patchRoleId = PathnameValidator(pathNames),
          patchRoleBody: any = await getRequestBody(request),
          beforeUpdateRole = await service.getRole(patchRoleId),
          updateRole = await service.editRole(patchRoleId, patchRoleBody);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: updateRole.id,
          entity_type: "Role item",
          action: "Editing a role",
          old_values: beforeUpdateRole,
          new_values: updateRole,
        });

        sendResponseMessage(200, false, updateRole, response);
        break;
      case "DELETE":
        const deleteRoleId: string = PathnameValidator(pathNames),
          beforeDeletionRole = await service.getRole(deleteRoleId);

        await service.deleteRole(deleteRoleId);

        await logsServ.createLog(user.departmentId, user.userId, {
          entity_id: deleteRoleId,
          entity_type: "Role item",
          action: "Deleting a role",
          old_values: beforeDeletionRole,
          new_values: {},
        });

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
