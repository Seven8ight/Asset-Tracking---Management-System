import { get, type IncomingMessage, type ServerResponse } from "http";
import type { Permission } from "./permission.types.js";
import {
  getRequestBody,
  PathnameValidator,
  sendResponseMessage,
} from "../../../Utilities/HttpFunctions.js";
import { permissionServ } from "../../../Data Objects/DTO.js";

export const PermissionController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames: string[] = requestUrl.pathname.split("/").filter(Boolean);

  const service = permissionServ;

  try {
    switch (request.method) {
      case "GET":
        const getPathname = PathnameValidator(pathNames);
        let responseBody: any;

        if (getPathname == "all")
          responseBody = await service.getAllPermission();
        else responseBody = await service.getPermission(getPathname);

        sendResponseMessage(200, false, responseBody, response);

        break;
      case "POST":
        const postReqBody: any = await getRequestBody(request);

        const permissionCreation: Permission =
          await service.createPermission(postReqBody);

        sendResponseMessage(201, false, permissionCreation, response);

        break;
      case "PATCH":
        const patchPermissionId: string = PathnameValidator(pathNames),
          patchReqBody: any = await getRequestBody(request);

        const permissionUpdate: Permission = await service.editPermission(
          patchPermissionId,
          patchReqBody,
        );

        sendResponseMessage(200, false, permissionUpdate, response);

        break;
      case "DELETE":
        const permissionId = PathnameValidator(pathNames);

        await service.deletePermission(permissionId);

        sendResponseMessage(
          204,
          false,
          "Permission deleted successfully",
          response,
        );
        break;
      default:
        sendResponseMessage(405, true, "Invalid HTTP method header", response);
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
