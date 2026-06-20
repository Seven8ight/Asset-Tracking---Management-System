import type { IncomingMessage, ServerResponse } from "http";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { AuthValidator } from "../../../Middleware/AuthChecker.js";
import { rolePermissionServ } from "../../../Data Objects/DTO.js";

export const RolePermissionController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathnames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const service = rolePermissionServ;

  try {
    const userDetails = AuthValidator(request);

    switch (request.method) {
      case "GET":
        const roleId: string = PathnameValidator(pathnames),
          rolePermissions = await service.getRolePermissions(roleId);

        sendResponseMessage(200, false, rolePermissions, response);
        break;
      case "POST":
        const postReqBody: any = await getRequestBody(request);

        const createRequest = await service.createRPermission(
          postReqBody.role_id,
          postReqBody.permission_id,
        );

        sendResponseMessage(201, false, createRequest, response);
        break;
      case "DELETE":
        const deleterRoleId = PathnameValidator(pathnames),
          permissionId: string | undefined = pathnames[3];

        if (!permissionId)
          throw new Error("Permission id must be provided in url segment");

        await service.deleteRolePermissions(deleterRoleId, permissionId);

        sendResponseMessage(
          204,
          false,
          "Role permission Deleted successfully",
          response,
        );
        break;
      default:
        sendResponseMessage(405, false, "Invalid HTTP header method", response);
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
