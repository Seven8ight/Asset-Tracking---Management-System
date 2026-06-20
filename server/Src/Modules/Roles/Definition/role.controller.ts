import type { IncomingMessage, ServerResponse } from "http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import {
  logsServ,
  rolesService,
  userRolesServ,
} from "../../../Data Objects/DTO.js";
import { PermissionChecker } from "../../../Middleware/PermissionChecker.js";

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
        await PermissionChecker(request, "users", "Manage user roles");

        const pathname = PathnameValidator(pathNames);
        let responseBody: any;

        if (pathname == "all") responseBody = await service.getRoles();
        else if (pathname == "department") {
          if (!user.departmentId)
            throw new Error("You must be a member of a department");

          responseBody = await service.getDepartmentRoles(user.departmentId);
        } else if (pathname == "permissions") {
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

        sendResponseMessage(200, false, responseBody, response);
        break;
      case "POST":
        await PermissionChecker(request, "users", "Manage user roles");

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
        await PermissionChecker(request, "users", "Manage user roles");

        const patchRoleId = PathnameValidator(pathNames),
          patchRoleBody: any = await getRequestBody(request);

        const allRoles = await rolesService.getRoles(),
          userRoles = await userRolesServ.getUserRoles(user.userId);

        for (let role of allRoles) {
          if (patchRoleId == role.id) {
            if (role.department_id == null) {
              if (!userRoles.roles.some((role) => role.name == "SaaS admin"))
                throw new Error("Unauthorized to do so");
            }
          }
        }

        const beforeUpdateRole = await service.getRole(patchRoleId),
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
        await PermissionChecker(request, "users", "Manage user roles");

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
